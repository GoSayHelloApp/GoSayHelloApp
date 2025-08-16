import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Stack,
  useTheme,
  Autocomplete,
  TextField,
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
import FlatPreferencesList from "../../ui/components/peopleCard/flatPreferencesList";

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
  const [searchMode, setSearchMode] = useState<"preferences" | "names">(
    "preferences"
  );
  const [selectedPreferenceType, setSelectedPreferenceType] = useState<{
    id: number;
    label: string;
    is_show: number;
  } | null>(null);
  const [nameSearch, setNameSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const preferences = FlatPreferencesList()?.map((preference) => ({
    id: preference.id,
    label: preference.name,
    is_show: 1,
  }));
  const [hasMorePages, setHasMorePages] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const [getNearbyUsersOrBusinesses, { isLoading, data }] =
    useGetNearbyUsersOrBusinessesMutation();
  const lastElementRef = useInfiniteScroll(() => {
    hasMorePages && setPageNo((prev) => prev + 1);
  }, isLoading);

  const fetchPeople = useCallback(async () => {
    if (!location) return;
    let params: Record<string, any> = {
      people_order_by: 0,
      longitude: location.longitude,
      latitude: location.latitude,
      page_no: pageNo,
      user_id: user?.id,
      nearby_type: nearbyType,
      ...(nearbyType == 2 && { preference_id: 0 }),
    };
    if (searchMode === "preferences" && selectedPreferenceType) {
      params = {
        ...params,
        search_type: 1,
        search_tag: selectedPreferenceType.label,
      };
    } else if (searchMode === "names" && nameSearch) {
      params = { ...params, search_type: 0, search_tag: nameSearch };
    }
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
  }, [
    location,
    pageNo,
    selectedPreferenceType,
    nameSearch,
    searchMode,
    nearbyType,
    user?.id,
    getNearbyUsersOrBusinesses,
  ]);

  useEffect(() => {
    setPeopleList([]);
    setPageNo(1);
    setHasMorePages(true);
  }, [selectedPreferenceType, nameSearch, searchMode]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  useEffect(() => {
    if (selectedPreferenceType === null && inputRef.current) {
      inputRef.current.blur();
    }
  }, [selectedPreferenceType]);

  const handleTabChange = (mode: "preferences" | "names") => {
    setSearchMode(mode);
    setSelectedPreferenceType(null);
    setNameSearch("");
    setPeopleList([]);
    setPageNo(1);
    setHasMorePages(true);
  };

  const handlePreferenceSelect = (event: any, newValue: any) => {
    setSelectedPreferenceType(newValue);
    setPeopleList([]);
    setPageNo(1);
    setHasMorePages(true);
  };

  const handleNameSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameSearch(event.target.value);
    setPeopleList([]);
    setPageNo(1);
    setHasMorePages(true);
  };

  // Handler to select a preference from a chip
  const handleChipPreferenceClick = (preferenceName: string) => {
    setSearchMode("preferences");
    const found = (preferences ?? []).find((p) => p.label === preferenceName);
    if (found) {
      setSelectedPreferenceType(found);
      setPeopleList([]);
      setPageNo(1);
      setHasMorePages(true);
    }
  };

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
                      handleChipPreferenceClick(pref.preference_type);
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
    <Box sx={{ overflow: "hidden" }}>
      {/* Tabs and Input always visible at the top */}
      <Box sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            mb: 1,
            borderRadius: {
              xs: "24px 24px 24px 24px",
              md: "24px 24px 24px 24px",
            },
            overflow: "hidden",
            bgcolor: theme.palette.grey[200],
          }}
        >
          <Button
            onClick={() => handleTabChange("preferences")}
            sx={{
              flex: 1,
              borderRadius: { xs: "24px 0 0 24px", md: "24px 0 0 24px" },
              bgcolor:
                searchMode === "preferences"
                  ? theme.palette.primary.main
                  : theme.palette.grey[200],
              color: searchMode === "preferences" ? "black" : "black",
              fontWeight: "normal",
              fontSize: { xs: 15, md: 18 },
              py: { xs: 1.5, md: 2 },
              minHeight: { xs: 28, md: 48 },
              boxShadow: "none",
              "&:hover": {
                bgcolor:
                  searchMode === "preferences"
                    ? theme.palette.primary.main
                    : theme.palette.grey[300],
              },
            }}
          >
            Search Preferences
          </Button>
          <Button
            onClick={() => handleTabChange("names")}
            sx={{
              flex: 1,
              borderRadius: { xs: "0 24px 24px 0", md: "0 24px 24px 0" },
              bgcolor:
                searchMode === "names"
                  ? theme.palette.primary.main
                  : theme.palette.grey[200],
              color: searchMode === "names" ? "black" : "black",
              fontWeight: "normal",
              fontSize: { xs: 15, md: 18 },
              py: { xs: 1.5, md: 2 },
              minHeight: { xs: 28, md: 48 },
              boxShadow: "none",
              "&:hover": {
                bgcolor:
                  searchMode === "names"
                    ? theme.palette.primary.main
                    : theme.palette.grey[300],
              },
            }}
          >
            Search Names
          </Button>
        </Box>
        <Box
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "0.5px solid #222A35",
            mb: 1,
            bgcolor: theme.palette.background.neutral,
          }}
        >
          {searchMode === "preferences" ? (
            <Autocomplete
              options={preferences ?? []}
              value={selectedPreferenceType}
              onChange={(_event, newValue) => {
                setSelectedPreferenceType(newValue);
                setPeopleList([]);
                setPageNo(1);
                setHasMorePages(true);
              }}
              getOptionLabel={(option) => option.label || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              clearIcon={<Icon icon="mdi:close-circle" fontSize={20} />}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 4,
                    mt: 0.5,
                  },
                },
              }}
              sx={{
                width: "100%",
                "& .MuiAutocomplete-clearIndicator": {
                  visibility: "visible",
                  opacity: 1,
                  pointerEvents: "auto",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={inputRef}
                  variant="outlined"
                  placeholder="Search Preferences"
                  InputProps={{
                    ...params.InputProps,
                    sx: { borderRadius: 4, bgcolor: "transparent" },
                  }}
                />
              )}
            />
          ) : (
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search Names"
              value={nameSearch}
              onChange={handleNameSearch}
              InputProps={{
                sx: { borderRadius: 4, bgcolor: "transparent" },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Scrollable results only */}
      <Box sx={{ maxHeight: { xs: "60vh", md: "66vh" }, overflow: "auto" }}>
        <Stack direction="column" gap={{ xs: 1, lg: 2.5 }}>
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
    </Box>
  );
};

export default People;
