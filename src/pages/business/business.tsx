import { Autocomplete, Box, Button, Chip, FormControl, InputAdornment, MenuItem, OutlinedInput, Select, Stack, TextField, useTheme } from "@mui/material";
import { useState, useRef, useMemo } from "react";
import debounce from "lodash/debounce";
import { Icon } from "@iconify/react";
import { useGetNearbyUsersOrBusinessesMutation } from "../../services/nearby/nearbyApi";
import { useLocation } from "../../hooks/useLocation";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import PreferencesList from "../../ui/components/peopleCard/preferencesList";
import PeopleCard from "../../ui/components/peopleCard/peopleCard";
import { PreferenceType } from '../../models/responseModels/preferences';
import { useAppSelector } from "../../redux/store";
import useNearbyData from "../../hooks/useNearByData";
import PreferenceMenuItems from "../../ui/components/peopleCard/preferenceMenuItems";
import FlatPreferencesList from "../../ui/components/peopleCard/flatPreferencesList";

type ChatButton = {
    text: string;
    color: "error" | "inherit" | "info" | "primary" | "secondary" | "success" | "warning";
};

const Business = () => {
    const theme = useTheme();
    const user = useAppSelector((state) => state.auth.user);
    const [selectedPreferenceType, setSelectedPreferenceType] = useState<PreferenceType | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const preferences = FlatPreferencesList()?.map((preference) => { return { id: preference.id, label: preference.name } });

    const params = useMemo(() => ({
        people_order_by: 0,
        user_id: user?.id,
        nearby_type: 2,
        preference_id: selectedPreferenceType?.id || 0,
    }), [user?.id, selectedPreferenceType?.id]);

    const { dataList: peopleList, isLoading, lastElementRef, setDataList, setPageNo, setHasMorePages } = useNearbyData(
        params,
        useGetNearbyUsersOrBusinessesMutation,
        'nearby_business_total_pages',
        "BusinessesNearBy",
    );

    const handlePreferenceSelect = (preference: PreferenceType) => {
        setDataList([]);
        setPageNo(1);
        setSelectedPreferenceType(preference);
        if (searchRef.current) searchRef.current.value = preference.name;
    };

    const buildPeopleCardData = (people: any[]) =>
        people.map((person) => {
            const chatButton: ChatButton =
                person.confirmation_status === -1 || person.confirmation_status === 2
                    ? { text: "Wave", color: "primary" }
                    : person.confirmation_status === 0
                        ? { text: person.is_connection_requested ? "Wave back" : "You Waved", color: "success" }
                        : { text: "Message", color: "success" };

            return {
                id: person.id,
                picture: person.image,
                name: person.name,
                interests: person.matchinginterest,
                distance: Math.ceil(person.distance * 20),
                tags: (
                    <Stack direction="row" gap={1.25} flexWrap="wrap" mt={1}>
                        {person.UserPreferences.map((pref: any) => (
                            <Chip key={pref.id} color="info" label={pref.preference_type} />
                        ))}
                    </Stack>
                ),
                button: (
                    <Button variant="contained" color={chatButton.color} size="large" sx={{ px: 5 }} disableElevation>
                        {chatButton.text}
                    </Button>
                ),
            };
        });

    const peopleCards = buildPeopleCardData(peopleList);

    return (
        <Box>
            <Autocomplete
                options={preferences ?? []}
                sx={{
                    width: '100%',
                    mt: 2,
                    borderRadius: 4,
                    bgcolor: theme.palette.background.neutral,
                    '.MuiAutocomplete-inputRoot': {
                        borderRadius: 4,
                        borderColor: theme.palette.grey[500],
                    },
                }}
                onChange={(event, newValue) => {
                    if (newValue) {
                        handlePreferenceSelect({ id: newValue.id, name: newValue.label, is_show: 1 });
                    } else {
                        setSelectedPreferenceType(null);
                    }
                }}
                renderInput={(params) =>
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Select Businesses" />}

            />
            <Stack direction="column" gap={{ xs: 1, lg: 2.5 }} overflow="auto">
                {peopleCards.map((person, index) => (
                    <Box ref={index === Math.floor(peopleCards.length / 2) ? lastElementRef : null} key={person.id}>
                        <PeopleCard
                            picture={person.picture}
                            name={person.name}
                            interests={person.interests}
                            distance={person.distance}
                            action={person.button}
                            tags={person.tags}
                        />
                    </Box>
                ))}
                {isLoading && <p>Loading...</p>}
            </Stack>
        </Box>
    );
};

export default Business;