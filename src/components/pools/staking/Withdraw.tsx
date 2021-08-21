// Copyright (C) 2021 Cartesi Pte. Ltd.

// This program is free software: you can redistribute it and/or modify it under
// the terms of the GNU General Public License as published by the Free Software
// Foundation, either version 3 of the License, or (at your option) any later
// version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
// PARTICULAR PURPOSE. See the GNU General Public License for more details.

import { FC } from 'react';
import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import {
    FormControl,
    FormErrorMessage,
    HStack,
    IconButton,
    Input,
    Text,
    Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { GrSubtract } from 'react-icons/gr';
import Title from './Title';

export interface WithdrawProps {
    balance: BigNumber;
    onCancel: () => void;
    onSubmit: (value: BigNumberish) => void;
}

const Withdraw: FC<WithdrawProps> = ({ balance, onCancel, onSubmit }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<{ withdraw: number }>({
        defaultValues: {
            withdraw: parseFloat(formatUnits(balance, 18)),
        },
        mode: 'onChange',
    });

    const validate = (value: number) => {
        const bn = parseUnits(value.toString(), 18);
        if (bn.isZero()) {
            return 'Value must be greater than 0';
        } else if (bn.gt(balance)) {
            return 'Not enough balance';
        }
        return true;
    };

    return (
        <HStack justify="space-between">
            <Title
                title="Withdraw"
                icon={<GrSubtract />}
                help="Amount of tokens to withdraw from pool"
            />
            <HStack align="baseline">
                <FormControl isInvalid={!!errors.withdraw}>
                    <Input
                        fontSize="xx-large"
                        textAlign="right"
                        type="number"
                        min={0}
                        autoFocus
                        isInvalid={!!errors.withdraw}
                        {...register('withdraw', {
                            required: true,
                            valueAsNumber: true,
                            validate,
                        })}
                    />
                    <FormErrorMessage>
                        {errors.withdraw?.message}
                    </FormErrorMessage>
                </FormControl>
                <Text fontSize="small">CTSI</Text>
                <HStack minW={100}>
                    <Tooltip label="Save" placement="top">
                        <IconButton
                            icon={<CheckIcon />}
                            aria-label="Save"
                            size="md"
                            onClick={handleSubmit((data) =>
                                onSubmit(
                                    parseUnits(data.withdraw.toString(), 18)
                                )
                            )}
                        />
                    </Tooltip>
                    <Tooltip label="Cancel" placement="top">
                        <IconButton
                            icon={<CloseIcon />}
                            aria-label="Cancel"
                            size="md"
                            onClick={onCancel}
                        />
                    </Tooltip>
                </HStack>
            </HStack>
        </HStack>
    );
};

export default Withdraw;