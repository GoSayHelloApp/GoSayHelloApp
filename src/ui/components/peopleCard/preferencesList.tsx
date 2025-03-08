import React, { useEffect } from 'react';
import { useGetPreferencesQuery } from '../../../services/preferences/preferenceApi';
import { Preference, PreferenceType } from '../../../models/responseModels/preferences';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { setAllPreferenceTypes } from '../../../services/preferences/preferenceSlice';
import FlatPreferencesList from './flatPreferencesList';

interface PreferencesListProps {
    onSelect: (selectedType: PreferenceType) => void;
    searchText: string | undefined;
    render: (preferences: PreferenceType[]) => React.ReactNode;
}

const PreferencesList: React.FC<PreferencesListProps> = ({ onSelect, searchText, render }) => {
    const preferences = FlatPreferencesList();
    const filteredPreferences = preferences ? preferences.filter((option) =>
        option.name.toLowerCase().includes(searchText?.toLowerCase() ?? '')
    ) : [];

    return <>{render(filteredPreferences)}</>;
};



export default PreferencesList;