import { Box, Heading } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import LoginButton from '../LoginButton';
import LogoutButton from '../LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';

interface LoginScreenProps {
  setUserName: (name: string) => void;
}

export default function LoginScreen(props: LoginScreenProps) {
  const { user, isAuthenticated } = useAuth0();
  useEffect(() => {
    async function checkUser() {
      if (isAuthenticated && user?.username) {
        props.setUserName(user.username);
      }
    }
    checkUser(); // called async checkUser()
  }, [isAuthenticated, props, user]);

  return (
    <Box marginBottom='2em' p='4' borderWidth='1px' borderRadius='lg'>
      {!isAuthenticated || !user ? (
        <div>
          <Heading as='h2' size='lg'>
            Log in with Auth 0
          </Heading>
          <LoginButton></LoginButton>
        </div>
      ) : (
        <Heading as='h3' size='lg'>
          Logged in as{' '}
          <span color='#03a1fc'>
            {' '}
            <u>{user?.username}</u>{' '}
          </span>{' '}
          <LogoutButton></LogoutButton>
        </Heading>
      )}
    </Box>
  );
}
