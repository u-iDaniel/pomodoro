"use client";
import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { deepPurple } from '@mui/material/colors';

export default function BlockList() {
  const [blockedSites, setBlockedSites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedSites = localStorage.getItem('blockedSites');
      return savedSites ? JSON.parse(savedSites) : [];
    }
    return [];
  });
  const [newSite, setNewSite] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blockedSites', JSON.stringify(blockedSites));
      window.postMessage({
        type: 'BLOCKED_SITES_UPDATE',
        blockedSites: blockedSites,
      });
    }
  }, [blockedSites]);

  const handleAddSite = () => {
    if (newSite.trim() !== '' && !blockedSites.includes(newSite.trim())) {
      setBlockedSites([...blockedSites, newSite.trim()]);
      setNewSite('');
    }
  };

  const handleRemoveSite = (siteToRemove: string) => {
    setBlockedSites(blockedSites.filter((site) => site !== siteToRemove));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddSite();
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, bgcolor: 'grey.100', color: 'black', margin: 'auto', mt: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 4 }}>
      <Typography variant="h4" sx={{ p: 2 }}>
        block distracting websites
      </Typography>
      <Typography variant="body2" sx={{ p: 2 }}>
        add websites you find distracting to this list. these websites will be blocked during your pomodoro sessions.
      </Typography>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          label="enter a website pattern to block"
          variant="outlined"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          onKeyDown={handleKeyPress}
          fullWidth
          autoComplete='off'
          size="small"
          sx={{
            input: { color: 'black' },
            '& .MuiInputLabel-root': {
              color: 'grey.700',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'grey.500',
              },
            },
          }}
        />
        <Button variant="contained" onClick={handleAddSite}>
          add
        </Button>
      </Box>
      <Divider>your blocked websites:</Divider>
      <List sx={{ pt: 0 }}>
        {blockedSites.length > 0 ? (
          blockedSites.map((site) => (
            <React.Fragment key={site}>
              <Divider />
              <ListItem
                sx={{ color: deepPurple["800"]  }}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveSite(site)}>
                    <DeleteIcon color='error' />
                  </IconButton>
                }
              >
                <ListItemText primary={site} />
              </ListItem>
            </React.Fragment>
          ))
        ) : (
          <>
            <Divider />
            <ListItem>
              <ListItemText primary="No websites are currently blocked." sx={{ textAlign: 'center', color: 'blue' }} />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
}