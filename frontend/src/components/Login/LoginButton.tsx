import React from 'react';
import { Button } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';

export default function LoginButton(): JSX.Element {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button onClick={() => loginWithRedirect()} type='submit'>
      Log In
    </Button>
  );
}
