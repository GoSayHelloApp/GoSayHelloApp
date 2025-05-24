import { max, over } from "lodash";

export const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: {
        xs: 0, // 16px padding on small screens
        md: 2, // 32px padding on large screens
    },
    backgroundColor: 'background.default',
};

export const cardStyles = {
    width: {
        xs: '100%', // 100% width on small screens
        md: '90%',  // 70% width on large screens
    },
    height: {
        xs: '100%', // 100% height on small screens
        md: 'auto',  // Auto height on large screens
    },
    maxWidth: 500,
    bgcolor: 'background.paper',
    boxShadow: 4,
    borderRadius: 2,
    paddingX: 1,
    paddingY: 3,
    textAlign: 'center',
};

export const headerStyles = {
    fontWeight: 'bold',
    marginBottom: 2,
};

export const descriptionStyles = {
    marginBottom: 3,
};

export const categoryHeaderStyles = {
    marginBottom: 2,
    fontWeight: 500,
    textAlign: 'left',
};

export const categoryBoxStyles = {
    marginBottom: 1,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
};

export const chipStyles = {
    margin: 0.5,
    cursor: 'pointer',
    color: 'text.primary',
};

export const dividerStyles = {
    marginBottom: 1,
    color: 'grey.500',
    border: 1,
};

export const preferenceTypeBoxStyles = {
    minHeight: '300px',
    maxHeight: '400px',
    overflow: 'auto',
};

export const preferenceTypeChipBoxStyles = {
    marginBottom: 1,
    display: 'flex',
    flexWrap: 'wrap',
    justifyItems: 'start',
    justifyContent: 'space-between',
    maxHeight: '40vh',
    overflowY: 'auto',
};

export const selectedTypesBoxStyles = {
    display: 'flex',
    justifyContent: 'left',
    gap: 1,
    marginTop: 5,
    marginBottom: 3,
    flexWrap: 'nowrap',
    maxHeight: '200px',
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
        display: 'none',
    },
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
};

export const submitButtonStyles = {
    borderRadius: '40px',
    textTransform: 'capitalize',
    padding: '10px',
    height: '60px',
};
