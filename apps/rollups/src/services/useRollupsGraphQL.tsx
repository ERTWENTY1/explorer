// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { useMemo } from 'react';
import { Client, createClient } from 'urql';
import { useNetwork } from './useNetwork';

export const useRollupsGraphQL = (address: string, manualUrl?: string) => {
    const network = useNetwork();
    return useMemo<Client | null>(() => {
        if (!network) {
            return null;
        }
        // Guess generate URL if only address is available
        // If manual-URL is passed down (usually is a user input) that will used instead
        const url = manualUrl ?? network.graphql(address);
        console.log(`${manualUrl} - ${url}`);
        return createClient({ url });
    }, [network, address, manualUrl]);
};