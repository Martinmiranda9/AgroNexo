import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Path alias imports (@/app, @/features, @/ui, @/core, @/shared)
import RootLayout from '@/app/layout';
import PublicPage from '@/app/(public)/page';
import LoginPage from '@/app/(public)/login/page';
import RegisterPage from '@/app/(public)/register/page';
import DashboardPage from '@/app/(authenticated)/dashboard/page';
import ProfilePage from '@/app/(authenticated)/profile/page';
import MatchDiscoveryPage from '@/app/(authenticated)/match-discovery/page';
import MatchesPage from '@/app/(authenticated)/matches/page';

import * as authFeature from '@/features/auth';
import * as profileFeature from '@/features/profile';
import * as matchDiscoveryFeature from '@/features/match-discovery';
import * as matchesFeature from '@/features/matches';

import { Button, Input, Card, Modal, Badge, Spinner, Toast } from '@/ui/components';
import DirectButton from '@/ui/components/Button';
import DirectInput from '@/ui/components/Input';
import DirectCard from '@/ui/components/Card';
import DirectModal from '@/ui/components/Modal';
import DirectBadge from '@/ui/components/Badge';
import DirectSpinner from '@/ui/components/Spinner';
import DirectToast from '@/ui/components/Toast';

import { AppShell, Navbar, MobileNav, Sidebar, Footer } from '@/ui/layouts';
import DirectAppShell from '@/ui/layouts/AppShell';
import DirectNavbar from '@/ui/layouts/Navbar';
import DirectMobileNav from '@/ui/layouts/MobileNav';
import DirectSidebar from '@/ui/layouts/Sidebar';
import DirectFooter from '@/ui/layouts/Footer';

import * as coreModels from '@/core/models';
import * as coreServices from '@/core/services';
import * as coreActions from '@/core/actions';
import { AuthProvider, QueryProvider } from '@/core/providers';
import { env } from '@/core/config/env';

import { cn } from '@/shared/utils';
import { cn as directCn } from '@/shared/utils/cn';
import * as sharedHooks from '@/shared/hooks';
import { ROUTES } from '@/shared/constants';
import * as commonTypes from '@/shared/types';

describe('AgroNexo Path Alias & Layer Resolution Empirical Verification', () => {
  describe('@/app/* alias resolution', () => {
    it('successfully imports and executes app route components', () => {
      expect(RootLayout).toBeDefined();
      expect(PublicPage).toBeDefined();
      expect(LoginPage).toBeDefined();
      expect(RegisterPage).toBeDefined();
      expect(DashboardPage).toBeDefined();
      expect(ProfilePage).toBeDefined();
      expect(MatchDiscoveryPage).toBeDefined();
      expect(MatchesPage).toBeDefined();

      expect(typeof PublicPage).toBe('function');
      expect(PublicPage()).toBeNull();
      expect(LoginPage()).toBeNull();
      expect(RegisterPage()).toBeNull();
      expect(DashboardPage()).toBeNull();
      expect(ProfilePage()).toBeNull();
      expect(MatchDiscoveryPage()).toBeNull();
      expect(MatchesPage()).toBeNull();
    });
  });

  describe('@/features/* alias resolution', () => {
    it('successfully resolves all feature module packages', () => {
      expect(authFeature).toBeDefined();
      expect(profileFeature).toBeDefined();
      expect(matchDiscoveryFeature).toBeDefined();
      expect(matchesFeature).toBeDefined();
    });
  });

  describe('@/ui/* alias resolution and React rendering', () => {
    it('successfully imports and renders barrel-exported UI components', () => {
      expect(Button).toBeDefined();
      expect(Input).toBeDefined();
      expect(Card).toBeDefined();
      expect(Modal).toBeDefined();
      expect(Badge).toBeDefined();
      expect(Spinner).toBeDefined();
      expect(Toast).toBeDefined();

      const { container: btnContainer } = render(React.createElement(Button));
      expect(btnContainer).toBeDefined();

      const { container: cardContainer } = render(React.createElement(Card));
      expect(cardContainer).toBeDefined();
    });

    it('successfully resolves direct UI component imports', () => {
      expect(DirectButton).toBe(Button);
      expect(DirectInput).toBe(Input);
      expect(DirectCard).toBe(Card);
      expect(DirectModal).toBe(Modal);
      expect(DirectBadge).toBe(Badge);
      expect(DirectSpinner).toBe(Spinner);
      expect(DirectToast).toBe(Toast);
    });

    it('successfully imports and renders UI layouts', () => {
      expect(AppShell).toBeDefined();
      expect(Navbar).toBeDefined();
      expect(MobileNav).toBeDefined();
      expect(Sidebar).toBeDefined();
      expect(Footer).toBeDefined();

      expect(DirectAppShell).toBe(AppShell);
      expect(DirectNavbar).toBe(Navbar);
      expect(DirectMobileNav).toBe(MobileNav);
      expect(DirectSidebar).toBe(Sidebar);
      expect(DirectFooter).toBe(Footer);

      const { container } = render(React.createElement(AppShell));
      expect(container).toBeDefined();
    });
  });

  describe('@/core/* alias resolution', () => {
    it('successfully resolves models, services, actions, and providers', () => {
      expect(coreModels).toBeDefined();
      expect(coreServices).toBeDefined();
      expect(coreActions).toBeDefined();
      expect(AuthProvider).toBeDefined();
      expect(QueryProvider).toBeDefined();
      expect(env).toBeDefined();
    });

    it('validates environment schema configuration', () => {
      expect(typeof env).toBe('object');
      // Under test NODE_ENV, skipValidation or mock ensures it loads cleanly
      expect(env.NODE_ENV).toBe('test');
    });
  });

  describe('@/shared/* alias resolution and utility behavior', () => {
    it('successfully executes cn utility function with tailwind-merge and clsx', () => {
      expect(cn).toBeDefined();
      expect(directCn).toBe(cn);

      const merged = cn('bg-page', 'text-dark', { 'p-4': true, 'p-2': false });
      expect(merged).toBe('bg-page text-dark p-4');

      // Tailwind class conflict resolution test
      const override = cn('p-4', 'p-6');
      expect(override).toBe('p-6');
    });

    it('successfully resolves shared hooks, constants, and types', () => {
      expect(sharedHooks).toBeDefined();
      expect(ROUTES).toBeDefined();
      expect(commonTypes).toBeDefined();
    });
  });
});
