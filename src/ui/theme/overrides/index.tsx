import merge from "lodash/merge";
import { Theme } from '@mui/material/styles';
//
import { button } from './components/button';
// import { textField } from './components/textfield';
// import { switches } from './components/switch';
// import { avatar } from './components/avatar';
// import { dataGrid } from './components/data-grid';
// import { checkbox } from './components/checkbox';
// import { autocomplete } from './components/autocomplete';
// import { appBar } from './components/appbar';
// import { breadcrumbs } from './components/breadcrumbs';
// import { datePicker } from './components/date-picker';
// import { buttonGroup } from './components/button-group';
// import { fab } from './components/fab';
// import { toggleButton } from './components/toggle-button';
// import { radio } from './components/radio';
// import { rating } from './components/rating';
// import { slider } from './components/slider';
// import { dialog } from './components/dialog';
// import { pagination } from './components/pagination';
// import { table } from './components/table';
// import { timeline } from './components/timeline';
// import { list } from './components/list';
// import { chip } from './components/chip';
// import { tooltip } from './components/tooltip';
// import { badge } from './components/badge';
// import { stepper } from './components/stepper';
import { tabs } from './components/tabs';
// import { menu } from './components/menu';
// import { accordion } from './components/accordion';
// import { card } from './components/card';
// import { backdrop } from './components/backdrop';
// import { typography } from './components/typography';

// ----------------------------------------------------------------------

export function componentsOverrides(theme: Theme) {
  const components = merge(
    button(theme),
    // textField(theme),
    // switches(theme),
    // avatar(theme),
    // dataGrid(theme),
    // checkbox(theme),
    // autocomplete(theme),
    // appBar(theme),
    // breadcrumbs(theme),
    // datePicker(theme),
    // buttonGroup(theme),
    // fab(theme),
    // toggleButton(theme),
    // radio(theme),
    // rating(theme),
    // slider(theme),
    // dialog(theme),
    // pagination(theme),
    // table(theme),
    // timeline(theme),
    // list(theme),
    // chip(theme),
    // tooltip(theme),
    // badge(theme),
    // stepper(theme),
    tabs(theme),
    // menu(theme),
    // accordion(theme),
    // card(theme),
    // backdrop(theme),
    // typography(theme),
    // menu(theme)
  );

  return components;
}
