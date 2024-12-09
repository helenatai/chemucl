'use client';

import { ReactNode } from 'react';

// third-party
import { Provider } from 'react-redux';

// project-import
import Locales from 'ui-component/Locales';
import NavigationScroll from 'layout/NavigationScroll';
import Snackbar from 'ui-component/extended/Snackbar';

import ThemeCustomization from 'themes';

import { store } from 'store';
import { ConfigProvider } from 'contexts/ConfigContext';

import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
// import { FirebaseProvider as AuthProvider } from '../contexts/FirebaseContext';
// import { Auth0Provider as AuthProvider } from '../contexts/Auth0Context';
// import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';

export default function ProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ConfigProvider>
        <ThemeCustomization>
          <Locales>
            <NavigationScroll>
              <AuthProvider>
                <>
                  <Snackbar />
                  {children}
                </>
              </AuthProvider>
            </NavigationScroll>
          </Locales>
        </ThemeCustomization>
      </ConfigProvider>
    </Provider>
  );
}
