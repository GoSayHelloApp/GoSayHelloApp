import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { useState, useRef, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import { Icon } from "@iconify/react";
import { useGetNearbyUsersOrBusinessesMutation } from "../../services/nearby/nearbyApi";
import { useLocation } from "../../hooks/useLocation";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import PreferencesList from "../../ui/components/peopleCard/preferencesList";
import PeopleCard from "../../ui/components/peopleCard/peopleCard";
import { PreferenceType } from "../../models/responseModels/preferences";
import { useAppSelector } from "../../redux/store";
import useNearbyData from "../../hooks/useNearByData";
import PreferenceMenuItems from "../../ui/components/peopleCard/preferenceMenuItems";
import FlatPreferencesList from "../../ui/components/peopleCard/flatPreferencesList";
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

const Business = () => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [selectedPreferenceType, setSelectedPreferenceType] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const preferences = FlatPreferencesList()?.map((preference) => ({
    id: preference.id,
    label: preference.name,
  }));

  const params = useMemo(
    () => ({
      people_order_by: 0,
      user_id: user?.id,
      nearby_type: 2,
      preference_id: selectedPreferenceType?.id || 0,
    }),
    [user?.id, selectedPreferenceType?.id]
  );

  const {
    dataList: peopleList,
    isLoading,
    lastElementRef,
    setDataList,
    setPageNo,
    setHasMorePages,
  } = useNearbyData(
    params,
    useGetNearbyUsersOrBusinessesMutation,
    "nearby_business_total_pages",
    "BusinessesNearBy"
  );

  // const handlePreferenceSelect = (preference: PreferenceType) => {
  //   setDataList([]);
  //   setPageNo(1);
  //   setSelectedPreferenceType(preference);
  //   if (searchRef.current) searchRef.current.value = preference.name;
  // };

  // Handler to select a preference from a chip
  const handleChipPreferenceClick = (preferenceName: string) => {
    const found = (preferences ?? []).find((p) => p.label === preferenceName);
    if (found) {
      setSelectedPreferenceType(found);
      setDataList([]);
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

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedPreferenceType === null && inputRef.current) {
      inputRef.current.blur();
    }
  }, [selectedPreferenceType]);

  return (
    <Box>
      {/* Autocomplete always visible at the top */}
      <Autocomplete
        options={preferences ?? []}
        value={selectedPreferenceType}
        onChange={(_event, newValue) => {
          setSelectedPreferenceType(newValue);
          setDataList([]);
          setPageNo(1);
          setHasMorePages(true);
        }}
        getOptionLabel={(option) => option.label || ""}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        clearIcon={<Icon icon="mdi:close-circle" fontSize={20} />}
        sx={{
          width: "100%",
          mt: 2,
          borderRadius: 4,
          bgcolor: theme.palette.background.neutral,
          ".MuiAutocomplete-inputRoot": {
            borderRadius: 4,
            borderColor: theme.palette.grey[500],
          },
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
            label="Select Businesses"
          />
        )}
      />
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
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Icon
                  icon="tabler:search-off"
                  fontSize={48}
                  color={theme.palette.grey[500]}
                />
                <p>No results found</p>
              </Box>
            </Box>
          )}
          {isLoading && <Loader />}
        </Stack>
      </Box>
    </Box>
  );
};

export default Business;
