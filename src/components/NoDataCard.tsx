import { Box, Stack, Typography, Avatar, useTheme } from "@mui/material";

function NoDataCard({
    text,
    logo,
}: {
    text: string;
    logo?: string; // Optional logo prop
}) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
                padding: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                width: { xs: "100%", },
                height: { xs: "200px", lg: "300px" },
                backgroundColor: theme.palette.background.paper,
            }}
        >
            {logo && (
                <Avatar
                    src={logo}
                    alt="No Data"
                    sx={{
                        width: { xs: 72, lg: 120 },
                        height: { xs: 72, lg: 120 },
                        marginBottom: 2,
                    }}
                />
            )}
            <Typography
                sx={{
                    fontSize: { xs: 16, lg: 20 },
                    textAlign: "center",
                    color: theme.palette.text.secondary,
                }}
            >
                {text}
            </Typography>
        </Box>
    );
}

export default NoDataCard;