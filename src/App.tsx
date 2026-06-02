/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MainDashboard } from './components/MainDashboard';
import { Auth } from './components/Auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full bg-background text-primary selection:bg-white/20">
      {isAuthenticated ? (
        <MainDashboard />
      ) : (
        <Auth onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}
