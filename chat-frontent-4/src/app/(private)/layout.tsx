'use client';

import ReduxProvider from '@redux/ReduxProvider';
import TrpcProvider from '@shared/api/trpc/provider';
import AppShell from '@modules/core/components/AppShell';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <TrpcProvider>
        <AppShell>{children}</AppShell>
      </TrpcProvider>
    </ReduxProvider>
  );
}
