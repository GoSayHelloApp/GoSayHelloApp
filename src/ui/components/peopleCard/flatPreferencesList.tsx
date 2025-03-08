import React, { useEffect } from 'react';
import { useGetPreferencesQuery } from '../../../services/preferences/preferenceApi';
import { Preference, PreferenceType } from '../../../models/responseModels/preferences';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { setAllPreferenceTypes } from '../../../services/preferences/preferenceSlice';



const FlatPreferencesList = () => {
    const dispatch = useAppDispatch();
    const preferences = useAppSelector((state) => state.preferences.allPreferenceTypes);
    const { data } = useGetPreferencesQuery(undefined, {
        skip: preferences != null && preferences?.length > 0,
    });

    const flatPreferenceTypes = (preferences: Preference[]): PreferenceType[] => {
        const allTypes = preferences.flatMap((preference) => preference.types);
        const uniqueTypesMap = new Map();
        allTypes.forEach((type) => {
            if (!uniqueTypesMap.has(type.name)) {
                uniqueTypesMap.set(type.name, type);
            }
        });
        return Array.from(uniqueTypesMap.values());
    };

    useEffect(() => {
        if (data?.Preferences) {
            dispatch(setAllPreferenceTypes(flatPreferenceTypes(data.Preferences ?? [])));
        }
    }, [data, dispatch]);

    return preferences;
};

export default FlatPreferencesList;