"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function PricingPage() {
    const handlePremiumClick = () => {
        // Here you would integrate with a payment provider like Stripe
        alert("Redirecting to payment provider...");
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", p: 4, backgroundColor: 'var(--primary)', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h2" component="h1" textAlign="center" sx={{ mb: 4, color: 'white', fontWeight: 'bold' }}>
                Pricing
            </Typography>
            <Grid container spacing={4} justifyContent="center" alignItems="stretch" >
                {/* Free Tier */}
                <Grid size={{xs: 12, md: 4}} >
                    <Card sx={{ borderRadius: '64px', p: "16px", height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Free
                            </Typography>
                            <Typography variant="h5" textAlign="center" sx={{ mb: 4 }}>
                                $0/lifetime
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Full pomodoro timer functionality ⌛" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Task list (3 free AI generations) 🤖" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Block list (up to 3 websites) 🚫" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Full customizability in settings ⚙️" />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Premium Tier */}
                <Grid size={{xs: 12, md: 4}}>
                    <Card sx={{ borderRadius: '64px', border: '2px solid #1DB954', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 2, fontWeight: 'bold', color: '#1DB954' }}>
                                Premium
                            </Typography>
                            <Typography variant="h5" textAlign="center" sx={{ mb: 4 }}>
                                $10/lifetime
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Everything in Free ✨" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Spotify Music Player (10x fewer ads if you don't have Spotify Premium) 🎶" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Unlimited site blocking 🚫" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Unlimited AI task list generation 🤖" />
                                </ListItem>
                            </List>
                        </CardContent>
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Button variant="contained" size="large" sx={{ borderRadius: '20px', backgroundColor: '#1DB954', '&:hover': { backgroundColor: '#1ed760' } }} onClick={handlePremiumClick}>
                                Go Premium
                            </Button>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
