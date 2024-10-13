import { Theme } from '@mui/material/styles';
import { buttonClasses } from '@mui/material/Button';
// components
import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

const dateList = [
  'DatePicker',
  'DateTimePicker',
  'StaticDatePicker',
  'DesktopDatePicker',
  'DesktopDateTimePicker',
  //
  'MobileDatePicker',
  'MobileDateTimePicker'
];

const timeList = ['TimePicker', 'MobileTimePicker', 'StaticTimePicker', 'DesktopTimePicker'];

const switchIcon = () => <Icon icon='eva:chevron-down-fill' width={24} />;

const leftIcon = () => <Icon icon='eva:arrow-ios-back-fill' width={24} />;

const rightIcon = () => <Icon icon='eva:arrow-ios-forward-fill' width={24} />;

const calendarIcon = () => <Icon icon='solar:calendar-mark-bold-duotone' width={24} />;

const clockIcon = () => <Icon icon='solar:clock-circle-outline' width={24} />;

const desktopTypes = dateList.reduce((result: Record<string, any>, currentValue) => {
  result[`Mui${currentValue}`] = {
    defaultProps: {
      slots: {
        openPickerIcon: calendarIcon,
        leftArrowIcon: leftIcon,
        rightArrowIcon: rightIcon,
        switchViewIcon: switchIcon
      }
    }
  };

  return result;
}, {});

const timeTypes = timeList.reduce((result: Record<string, any>, currentValue) => {
  result[`Mui${currentValue}`] = {
    defaultProps: {
      slots: {
        openPickerIcon: clockIcon,
        rightArrowIcon: rightIcon,
        switchViewIcon: switchIcon
      }
    }
  };

  return result;
}, {});

export function datePicker(theme: Theme) {
  return {
    MuiPickersLayout: {
      styleOverrides: {
        root: {
          '& .MuiPickersLayout-actionBar': {
            [`& .${buttonClasses.root}:last-of-type`]: {
              backgroundColor: theme.palette.text.primary,
              color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.grey[800]
            }
          }
        }
      }
    },

    // Date
    ...desktopTypes,

    // Time
    ...timeTypes
  };
}
