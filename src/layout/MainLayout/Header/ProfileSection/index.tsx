import { useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import useUser from 'hooks/useUser';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';

// assets
import { IconLogout } from '@tabler/icons-react';

// ==============================|| PROFILE MENU ||============================== //

const getInitials = (name: string = '') => {
  const names = name.split(' ');
  return names
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const ProfileSection = () => {
  const theme = useTheme();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<any>(null);

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: '/login'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleClose = (event: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const userInitials = getInitials(user?.name);

  return (
    <>
      <Chip
        sx={{
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          transition: 'all .2s ease-in-out',
          borderColor: theme.palette.primary.light,
          bgcolor: theme.palette.primary.light,
          '&[aria-controls="menu-list-grow"], &:hover': {
            borderColor: theme.palette.primary.light,
            bgcolor: `${theme.palette.grey[200]} !important`,
            '& .MuiAvatar-root': {
              bgcolor: '#1e88e5 !important'
            }
          },
          '& .MuiChip-label': {
            display: 'none'
          }
        }}
        icon={
          <Avatar
            sx={{
              width: 34,
              height: 34,
              margin: '8px !important',
              cursor: 'pointer',
              bgcolor: '#1e88e5 !important',
              color: '#fff !important',
              fontWeight: 500,
              fontSize: '1.1rem'
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
          >
            {userInitials}
          </Avatar>
        }
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
      />
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 14]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper sx={{ boxShadow: theme.shadows[8], minWidth: 250 }}>
                <MainCard border={false} elevation={16} content={false} boxShadow>
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: '#1e88e5',
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '1rem'
                        }}
                      >
                        {userInitials}
                      </Avatar>
                      <Stack spacing={0.3}>
                        <Typography variant="h5">{user?.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {user?.permission}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                  <Divider />
                  <Box>
                    <ListItemButton
                      onClick={handleLogout}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          bgcolor: theme.palette.grey[100]
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <IconLogout stroke={1.5} size="20px" color={theme.palette.primary.main} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color={theme.palette.primary.main}>
                            Logout
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </Box>
                </MainCard>
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
};

export default ProfileSection;
