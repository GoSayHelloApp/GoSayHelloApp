import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Stack,
  useTheme,
} from "@mui/material";
import { useState, useEffect, useRef, useCallback } from "react";
import debounce from "lodash/debounce";
import { Icon } from "@iconify/react";
import { useGetNearbyUsersOrBusinessesMutation } from "../../services/nearby/nearbyApi";
import { useLocation } from "../../hooks/useLocation";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import SearchTabs from "../../ui/components/peopleCard/searchTabs";
import PreferencesList from "../../ui/components/peopleCard/preferencesList";
import PeopleCard from "../../ui/components/peopleCard/peopleCard";
import { PreferenceType } from "../../models/responseModels/preferences";
import { useAppSelector } from "../../redux/store";
import PreferenceMenuItems from "../../ui/components/peopleCard/preferenceMenuItems";
import Loader from "../../ui/components/core/screenLoader";

type ChatButton = {
  text: string;
  color:
    | "error"
    | "inherit"
    | "info"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
};

const People = ({ nearbyType }: { nearbyType: number }) => {
  const theme = useTheme();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const [pageNo, setPageNo] = useState(1);
  const [peopleList, setPeopleList] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPreferenceType, setSelectedPreferenceType] =
    useState<PreferenceType | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const preferencesRef = useRef<HTMLDivElement>(null);
  const [hasMorePages, setHasMorePages] = useState(true);

  const [getNearbyUsersOrBusinesses, { isLoading, data }] =
    useGetNearbyUsersOrBusinessesMutation();
  const lastElementRef = useInfiniteScroll(() => {
    hasMorePages && setPageNo((prev) => prev + 1);
  }, isLoading);

  const fetchPeople = useCallback(async () => {
    if (!location) return;
    const params: Record<string, any> = {
      people_order_by: 0,
      longitude: location.longitude,
      latitude: location.latitude,
      page_no: pageNo,
      user_id: user?.id,
      nearby_type: nearbyType,
      ...(selectedPreferenceType &&
        selectedTab == 0 && { search_type: 1, search_tag: searchText }),
      ...(nearbyType == 2 && { preference_id: 0 }),
      ...(selectedTab == 1 &&
        searchText != "" && { search_type: 0, search_tag: searchText }),
    };

    try {
      const response = await getNearbyUsersOrBusinesses(params).unwrap();
      let body = response.PeoplesNearBy || response.BusinessesNearBy;
      setPeopleList((prev) => [...prev, ...body]);
      if (pageNo >= response.nearby_people_total_pages) {
        setHasMorePages(false);
      }
    } catch (error) {
      console.error("Error fetching people:", error);
    }
  }, [location, pageNo, searchText, getNearbyUsersOrBusinesses]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current?.contains(event.target as Node) ||
        preferencesRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setIsSearchFocused(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = (index: number) => setSelectedTab(index);

  const handlePreferenceSelect = (preference: PreferenceType) => {
    setPeopleList([]);
    setPageNo(1);
    setSelectedPreferenceType(preference);
    setSearchText(preference.name);
    if (searchRef.current) searchRef.current.value = preference.name;
  };

  const handleSearchChange = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPeopleList([]);
      setPageNo(1);
      setSearchText(event.target.value);
      setSelectedPreferenceType((prev) => {
        if (prev) {
          return { ...prev, name: event.target.value };
        }
        return { name: event.target.value, id: 0, is_show: 1 };
      });
      setHasMorePages(true);
    },
    500
  );

  const buildPeopleCardData = (people: any[]) =>
    people.map((person) => {
      const userPreferenceIds = user?.UserPreferences.map(
        (x) => x.preference_type_id
      );
      const chatButton: ChatButton =
        person.confirmation_status === -1 || person.confirmation_status === 2
          ? { text: "Wave", color: "primary" }
          : person.confirmation_status === 0
          ? {
              text: person.is_connection_requested ? "You Waved" : "Wave back",

              color: person.is_connection_requested ? "inherit" : "success",
            }
          : { text: "Message", color: "success" };

      return {
        id: person.id,
        picture: person.image,
        name: person.name,
        interests: person.matchinginterest,
        distance: Math.ceil(person.distance * 20),
        tags: (
          <Stack
            direction="row"
            gap={1.25}
            flexWrap="nowrap"
            mt={1}
            sx={{
              overflow: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              "-ms-overflow-style": "none",
              "scrollbar-width": "none",
            }}
          >
            {[...person.UserPreferences]
              .sort((a: any, b: any) => {
                const aMatch = userPreferenceIds?.includes(
                  a.preference_type_id
                );
                const bMatch = userPreferenceIds?.includes(
                  b.preference_type_id
                );
                return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
              })
              .map((pref: any) => {
                const isMatch = user?.UserPreferences?.map(
                  (x) => x.preference_type_id
                ).includes(pref.preference_type_id);
                return (
                  <Chip
                    key={pref.preference_type_id}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    color={isMatch ? "info" : "default"}
                    label={pref.preference_type}
                    icon={
                      isMatch ? (
                        <Icon
                          icon="mdi:star"
                          fontSize={16}
                          style={{ marginLeft: 9 }}
                        />
                      ) : undefined
                    }
                    sx={
                      !isMatch
                        ? {
                            color: theme.palette.text.primary,
                            border: "1px solid #e0e0e0",
                            bgcolor: theme.palette.grey[300],
                          }
                        : {}
                    }
                  />
                );
              })}
          </Stack>
        ),
        button: (
          <Button
            variant="contained"
            color={chatButton.color}
            size="large"
            sx={{ px: 5 }}
            disableElevation
          >
            {chatButton.text}
          </Button>
        ),
      };
    });

  const peopleCards = buildPeopleCardData(peopleList);

  return (
    <Box>
      <FormControl variant="outlined" hiddenLabel fullWidth size="medium">
        <OutlinedInput
          onChange={handleSearchChange}
          inputRef={searchRef}
          sx={{
            mx: {
              xs: 1,
              sm: 2,
              md: 3,
            },
            my: 1,
            borderRadius: 4,
            bgcolor: theme.palette.background.neutral,
            paddingRight: 0.5,
          }}
          onFocus={() => setIsSearchFocused(true)}
          placeholder="Search"
          startAdornment={
            <InputAdornment position="start">
              <Icon icon="tabler:search" fontSize={24} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <SearchTabs onTabChange={handleTabChange} />
            </InputAdornment>
          }
        />
        {isSearchFocused && selectedTab === 0 && !selectedPreferenceType && (
          <div ref={preferencesRef}>
            <PreferencesList
              onSelect={handlePreferenceSelect}
              searchText={searchText}
              render={(preferences) => (
                <PreferenceMenuItems
                  preferences={preferences}
                  onSelect={handlePreferenceSelect}
                />
              )}
            />
          </div>
        )}
      </FormControl>
      <Stack direction="column" gap={{ xs: 1, lg: 2.5 }} overflow="auto">
        {peopleCards.map((person, index) => (
          <Box
            ref={
              index === Math.floor(peopleCards.length / 2)
                ? lastElementRef
                : null
            }
            key={person.id}
          >
            <PeopleCard
              id={person.id}
              picture={person.picture}
              name={person.name}
              interests={person.interests}
              distance={person.distance}
              action={person.button}
              tags={person.tags}
            />
          </Box>
        ))}
        {peopleCards.length === 0 && !isLoading && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Icon
              icon="tabler:search-off"
              fontSize={48}
              color={theme.palette.grey[500]}
            />
            <p>No results found</p>
          </Box>
        )}
        {isLoading && <Loader />}
      </Stack>
    </Box>
  );
};

export default People;
