// Copyright (C) 2021 Cartesi Pte. Ltd.

// This program is free software: you can redistribute it and/or modify it under
// the terms of the GNU General Public License as published by the Free Software
// Foundation, either version 3 of the License, or (at your option) any later
// version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
// PARTICULAR PURPOSE. See the GNU General Public License for more details.

import React, { FC } from 'react';
import {
    Table,
    Tbody,
    Td,
    Text,
    Tr,
    Th,
    Thead,
    HStack,
    Spinner,
    useBreakpointValue,
} from '@chakra-ui/react';
import { BigNumber } from '@ethersproject/bignumber';
import { PoolBalance } from '../../graphql/models';
import { TableResponsiveHolder } from '../TableResponsiveHolder';
import UserStakingPoolsTableRow from './UserStakingPoolsTableRow';

export interface UserStakingPoolsProps {
    chainId: number;
    account?: string;
    walletBalance: BigNumber;
    loading: boolean;
    data?: PoolBalance[];
}

const UserStakingPools: FC<UserStakingPoolsProps> = ({
    chainId,
    account,
    walletBalance,
    data,
    loading,
}) => {
    // number of columns at each breakpoint
    const columns = useBreakpointValue([3, 3, 4, 8]);

    return (
        <TableResponsiveHolder>
            <Table>
                <Thead>
                    <Tr>
                        <Th>Pool Address</Th>
                        <Th isNumeric>Unstaked</Th>
                        <Th isNumeric>Staked</Th>
                        <Th isNumeric>% Pool</Th>
                        <Th isNumeric>Stake/Info</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {loading && (
                        <Tr>
                            <Td colSpan={columns} textAlign="center">
                                <HStack justify="center">
                                    <Spinner />
                                    <Text>Loading</Text>
                                </HStack>
                            </Td>
                        </Tr>
                    )}
                    {!loading &&
                        (!data ||
                            (data.length === 0 && (
                                <Tr>
                                    <Td colSpan={columns} textAlign="center">
                                        <Text>No items</Text>
                                    </Td>
                                </Tr>
                            )))}
                    {!loading &&
                        data &&
                        data.length > 0 &&
                        data.map((balance) => (
                            <UserStakingPoolsTableRow
                                key={balance.pool.id}
                                chainId={chainId}
                                walletBalance={walletBalance}
                                balance={balance}
                                account={account}
                            />
                        ))}
                </Tbody>
            </Table>
        </TableResponsiveHolder>
    );
};

export default UserStakingPools;
