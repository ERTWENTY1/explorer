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
    Button,
    HStack,
    Stack,
    Td,
    Tooltip,
    Tr,
    useColorModeValue,
} from '@chakra-ui/react';
import {
    ArrowBackIcon,
    ArrowForwardIcon,
    EditIcon,
    LockIcon,
} from '@chakra-ui/icons';
import { BigNumber } from '@ethersproject/bignumber';

import { PoolBalance } from '../../graphql/models';
import Address from '../../components/Address';
import { formatCTSI } from '../../utils/token';
import { FaCoins } from 'react-icons/fa';
import IconLink from '../IconLink';
import { poolAmount, userShare } from '../../graphql/hooks/usePoolBalances';
import { useStakingPool } from '../../services/pool';

export interface UserPoolRowProps {
    chainId: number;
    walletBalance: BigNumber;
    balance: PoolBalance;
    account?: string;
    size?: 'lg' | 'md' | 'sm' | 'xs';
}

const UserPoolRow: FC<UserPoolRowProps> = ({
    chainId,
    walletBalance,
    account,
    balance,
    size = 'lg',
}) => {
    // hover style
    const backgroundColor = useColorModeValue('WhiteSmoke', 'gray.700');

    // poor manager is logged user, allow edit
    const edit = account && account.toLowerCase() === balance.pool.manager;

    // calculate user stake
    const stakedBalance = poolAmount(balance);

    const percentFormatter = new Intl.NumberFormat('en-US', {
        style: 'percent',
    });

    const address = balance.pool.id;

    // query pool data
    const { stake, withdraw, transaction } = useStakingPool(address, account);

    return (
        <Tr key={balance.pool.id} _hover={{ backgroundColor }}>
            <Td>
                <Address
                    ens
                    address={balance.pool.id}
                    chainId={chainId}
                    truncated
                />
            </Td>
            <Td isNumeric>{formatCTSI(walletBalance, 2)} CTSI</Td>
            <Td isNumeric>
                <Button
                    leftIcon={<ArrowBackIcon />}
                    size="sm"
                    disabled={BigNumber.from(balance.balance).isZero()}
                    onClick={() => withdraw(balance.balance)}
                    isLoading={transaction.submitting}
                >
                    Withdraw
                </Button>
            </Td>
            <Td isNumeric>{formatCTSI(balance.balance, 2)} CTSI</Td>
            <Td isNumeric>
                <Button
                    rightIcon={<ArrowForwardIcon />}
                    size="sm"
                    disabled={BigNumber.from(balance.balance).isZero()}
                    onClick={() => stake(balance.balance)}
                    isLoading={transaction.submitting}
                >
                    Stake
                </Button>
            </Td>
            <Td isNumeric>{formatCTSI(stakedBalance, 2)} CTSI</Td>
            {size == 'lg' && (
                <Td isNumeric>{percentFormatter.format(userShare(balance))}</Td>
            )}
            <Td>
                <HStack justify="flex-end">
                    {edit && (
                        <IconLink
                            href={'/pools/' + balance.pool.id + '/edit'}
                            icon={<EditIcon />}
                            tooltip="Edit"
                        />
                    )}
                    <IconLink
                        href={'/pools/' + balance.pool.id}
                        icon={<FaCoins />}
                        tooltip="Stake"
                    />
                    {balance.pool.paused && (
                        <Tooltip
                            placement="top"
                            label="This pool is not accepting stake at the moment"
                            fontSize="small"
                            bg="black"
                            color="white"
                        >
                            <LockIcon />
                        </Tooltip>
                    )}
                </HStack>
            </Td>
        </Tr>
    );
};

export default UserPoolRow;