import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@chakra-ui/react';

export default function LogoutButton(): JSX.Element {
  const { logout } = useAuth0();

  return (
    <Button
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      type='submit'>
      Log Out
    </Button>
  );
}
