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
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const canceled = searchParams.get("canceled");

  const handleNotLoggedIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push("/login");
  }

  if (canceled) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", p: 4, backgroundColor: 'var(--primary)', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h2" component="h1" textAlign="center" sx={{ mb: 4, color: 'white', fontWeight: 'bold' }}>
          payment canceled
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 2, color: 'white' }}>
          your payment has been canceled. you can try again if you wish.
        </Typography>
      </Box>
    );
  }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", p: 4, backgroundColor: 'var(--primary)', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h2" component="h1" textAlign="center" sx={{ mb: 4, color: 'white', fontWeight: 'bold' }}>
                pricing
            </Typography>
            <Grid container spacing={4} justifyContent="center" alignItems="stretch" >
                {/* Free Tier */}
                <Grid size={{xs: 12, md: 4}} >
                    <Card sx={{ borderRadius: '64px', p: "16px", height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                                free
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="full pomodoro timer functionality ⌛" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="task list (3 free AI generations) 🤖" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="block list (up to 3 websites) 🚫" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="full customizability in settings ⚙️" />
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
                                premium
                            </Typography>
                            <Typography variant="h5" textAlign="center" sx={{ mb: 4 }}>
                                $10 for lifetime access
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="everything in free ✨" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="spotify music player (10x fewer ads if you don't have spotify premium) 🎶" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="unlimited site blocking 🚫" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="unlimited AI task list generation 🤖" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="plus full access to future releases! (e.g. gamification, streaks, and more!) 📈" />
                                </ListItem>
                            </List>
                        </CardContent>
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <form action="/api/checkout_sessions" method="post">
                          {session?.user ? (
                            <Button disabled={session?.user?.isMember ?? undefined} type="submit" variant="contained" size="large" sx={{ borderRadius: '20px', backgroundColor: '#1DB954', '&:hover': { backgroundColor: '#1ed760' } }}>
                                go premium
                            </Button>
                          ) : (
                            <Button onClick={handleNotLoggedIn} variant="contained" size="large" sx={{ borderRadius: '20px', backgroundColor: '#1DB954', '&:hover': { backgroundColor: '#1ed760' } }}>
                                go premium
                            </Button>
                          )}
                          </form>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
