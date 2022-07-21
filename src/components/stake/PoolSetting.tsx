// Copyright (C) 2021 Cartesi Pte. Ltd.

// This program is free software: you can redistribute it and/or modify it under
// the terms of the GNU General Public License as published by the Free Software
// Foundation, either version 3 of the License, or (at your option) any later
// version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
// PARTICULAR PURPOSE. See the GNU General Public License for more details.

import React, { FC, useCallback, useEffect, useState } from 'react';
import {
    Alert,
    AlertDescription,
    AlertIcon,
    Box,
    Button,
    CloseButton,
    Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Heading,
    HStack,
    Icon,
    Input,
    InputGroup,
    Link,
    Spinner,
    Stack,
    Switch,
    Text,
    Tooltip,
    VStack,
} from '@chakra-ui/react';
import { FaBalanceScaleLeft } from 'react-icons/fa';
import { useWallet } from '../../contexts/wallet';
import useTotalPoolBalance from '../../graphql/hooks/useTotalPoolBalance';
import CTSIText from '../CTSIText';
import { useRouter } from 'next/router';
import { useStakingPool } from '../../services/pool';
import { useForm } from 'react-hook-form';
import Address from '../Address';
import { validateEns } from '../../utils/validation';
import useStakingPoolQuery from '../../graphql/hooks/useStakingPool';
import FlatRateContainer from '../../containers/stake/FlatRateContainer';
import { ContractTransaction } from 'ethers';
import GasTaxContainer from '../../containers/stake/GasTaxContainer';

export const PoolSetting: FC = () => {
    const router = useRouter();
    const address = router.query.pool as string;
    const { account } = useWallet();
    const pool = useStakingPool(address, account);
    const poolBalance = useTotalPoolBalance(account);
    const stakingPool = useStakingPoolQuery(address);
    const [isChangingEns, setChangingEns] = useState<boolean>(false);
    const [isChangingStaking, setChangingStaking] = useState<boolean>(false);
    const [isRebalancing, setRebalancing] = useState<boolean>(false);
    const [commissionError, setCommissionError] = useState<
        string | undefined
    >();
    const [commissionSuccess, setCommissionSuccess] = useState<
        ContractTransaction | undefined
    >();
    const progress = pool.transaction?.receipt?.confirmations || 0;
    const isRebalanceDisabled =
        pool.amounts?.stake?.isZero() &&
        pool.amounts?.unstake?.isZero() &&
        pool.amounts?.withdraw?.isZero();
    const isMakingPoolTransaction =
        !pool.transaction?.acknowledged &&
        !pool.transaction?.error &&
        progress === 0;
    const feeType =
        stakingPool?.fee?.commission !== null
            ? 'flatRate'
            : stakingPool?.fee?.gas !== null
            ? 'gasTax'
            : undefined;

    const {
        register,
        trigger,
        getValues,
        formState: { errors, touchedFields },
    } = useForm<{ ensName: string }>({
        defaultValues: {
            ensName: '',
        },
    });

    const validate = (value: string) => {
        if (value === '') {
            return true;
        }

        if (!validateEns(value)) {
            return 'Enter a valid ENS name';
        }

        return true;
    };

    const {
        ref,
        name,
        onChange: onChangeValidate,
    } = register('ensName', {
        shouldUnregister: true,
        validate,
    });

    const onCommissionSuccess = useCallback(
        (transaction: ContractTransaction) => {
            setCommissionSuccess(transaction);
        },
        []
    );

    const onCommissionError = useCallback((error: string) => {
        setCommissionError(error);
    }, []);

    useEffect(() => {
        if (pool.transaction?.error || progress >= 1) {
            setChangingStaking(false);
            setChangingEns(false);
            setRebalancing(false);
        }
    }, [pool.transaction]);

    return (
        <Box
            px={{ base: '6vw', lg: '12vw', xl: '18vw' }}
            pb={{ base: 6, sm: 8, lg: 8 }}
            fontSize={'xl'}
        >
            {(pool.transaction?.error || commissionError) && (
                <Alert status="error" variant="left-accent" mt={2}>
                    <AlertIcon />
                    <Box flex="1">
                        <AlertDescription display="block">
                            {pool.transaction?.error || commissionError}
                        </AlertDescription>
                    </Box>
                </Alert>
            )}

            {(progress >= 1 || commissionSuccess) && (
                <Alert status="success" variant="left-accent" mt={2}>
                    <AlertIcon />
                    <Box flex="1">
                        <HStack>
                            {progress >= 1 &&
                                pool.transaction?.transaction?.hash && (
                                    <Address
                                        address={
                                            pool.transaction?.transaction?.hash
                                        }
                                        type="tx"
                                        truncated
                                        chainId={
                                            pool.transaction?.transaction
                                                ?.chainId
                                        }
                                    />
                                )}

                            {commissionSuccess && (
                                <Address
                                    address={commissionSuccess?.hash}
                                    type="tx"
                                    truncated
                                    chainId={commissionSuccess?.chainId}
                                />
                            )}
                        </HStack>
                    </Box>
                </Alert>
            )}

            {isRebalancing && isMakingPoolTransaction && (
                <Alert status="info" variant="left-accent">
                    <Spinner mx={2} />
                    <CloseButton
                        position="absolute"
                        right="8px"
                        top="8px"
                        onClick={() => {
                            setRebalancing(false);
                            pool.transaction?.ack();
                        }}
                    />
                </Alert>
            )}

            <Stack
                spacing={4}
                justifyContent="space-between"
                alignContent="flex-start"
                mt={16}
                mb={10}
                direction={{ base: 'column', md: 'row' }}
            >
                <Box>
                    <Heading as="h2" mb={0}>
                        Pool Setting
                    </Heading>
                    <Text fontSize="sm">
                        All actions approved by wallet transaction.
                    </Text>
                </Box>

                <Box>
                    <VStack>
                        <Button
                            bgColor={'orange.100'}
                            w={{ base: '100%', md: 'auto' }}
                            minW="15rem"
                            leftIcon={<FaBalanceScaleLeft />}
                            isDisabled={isRebalanceDisabled}
                            onClick={() => {
                                pool.rebalance();
                                setRebalancing(true);
                            }}
                        >
                            REBALANCE
                        </Button>

                        <Flex
                            fontSize={'sm'}
                            alignSelf="flex-end"
                            align="center"
                        >
                            <Flex align="end" mr={2}>
                                <Text mr={1} lineHeight={1}>
                                    Pool balance:
                                </Text>
                                <CTSIText
                                    value={poolBalance}
                                    fontSize="1x1"
                                    lineHeight={1}
                                />
                            </Flex>

                            <Tooltip
                                placement="bottom"
                                label="Total amount of tokens staked in this pool"
                                fontSize="small"
                                bg="black"
                                color="white"
                            >
                                <Icon
                                    width={3}
                                    height={3}
                                    color="gray.600"
                                    role="balance-icon"
                                />
                            </Tooltip>
                        </Flex>
                    </VStack>
                </Box>
            </Stack>

            {feeType == 'flatRate' && (
                <FlatRateContainer
                    pool={address}
                    onSuccess={onCommissionSuccess}
                    onError={onCommissionError}
                />
            )}

            {feeType == 'gasTax' && (
                <GasTaxContainer
                    pool={address}
                    onSuccess={onCommissionSuccess}
                    onError={onCommissionError}
                />
            )}

            <Stack
                justifySelf="flex-end"
                justifyContent="flex-end"
                alignItems="flex-end"
                mt={2}
            >
                <FormControl isInvalid={!!errors.ensName}>
                    <HStack justify="space-between">
                        <FormLabel>
                            Pool ENS name{' '}
                            <Tooltip
                                placement="bottom"
                                label="Enter a registered ENS domain name"
                                fontSize="small"
                                bg="black"
                                color="white"
                            >
                                <Icon
                                    pb={1}
                                    width={4}
                                    height={4}
                                    color="gray.600"
                                    role="pool-icon"
                                />
                            </Tooltip>
                        </FormLabel>
                    </HStack>
                    <Stack direction={['column', 'row']}>
                        <InputGroup me={6}>
                            <Input
                                size="lg"
                                ref={ref}
                                name={name}
                                isInvalid={!!errors.ensName}
                                onBlur={() => trigger('ensName')}
                                onChange={(event) => {
                                    onChangeValidate(event);
                                    trigger('ensName');
                                }}
                            />
                        </InputGroup>
                        <Button
                            colorScheme="blue"
                            w={{ base: '100%', md: 'auto' }}
                            minW="15rem"
                            isDisabled={
                                getValues('ensName') === '' ||
                                !!touchedFields.ensName ||
                                !!errors.ensName ||
                                progress >= 1
                            }
                            onClick={() => {
                                setChangingEns(true);
                                pool.setName(getValues('ensName'));
                            }}
                        >
                            UPDATE
                        </Button>
                    </Stack>

                    {!errors.ensName ? (
                        <FormHelperText>
                            After registering an ENS domain and setting it up,
                            set the name here.
                        </FormHelperText>
                    ) : (
                        <FormErrorMessage>
                            {errors.ensName?.message}
                        </FormErrorMessage>
                    )}
                </FormControl>

                {isChangingEns && isMakingPoolTransaction && (
                    <Alert status="info" variant="left-accent">
                        <Spinner mx={2} />
                        <CloseButton
                            position="absolute"
                            right="8px"
                            top="8px"
                            onClick={() => {
                                setChangingEns(false);
                                pool.transaction?.ack();
                            }}
                        />
                    </Alert>
                )}

                <FormControl>
                    <HStack mt={4} justify="space-between">
                        <FormLabel>
                            Staking{' '}
                            <Tooltip
                                placement="bottom"
                                label="Open or close the pool for new stakes"
                                fontSize="small"
                                bg="black"
                                color="white"
                            >
                                <Icon
                                    pb={1}
                                    width={4}
                                    height={4}
                                    color="gray.600"
                                    role="staking-icon"
                                />
                            </Tooltip>
                        </FormLabel>
                    </HStack>
                    <HStack>
                        <InputGroup me={6}>
                            <Switch
                                size="lg"
                                me={3}
                                defaultChecked
                                isChecked={!pool.paused}
                                onChange={() => {
                                    setChangingStaking(true);

                                    if (pool.paused) {
                                        pool.unpause();
                                    } else {
                                        pool.pause();
                                    }
                                }}
                            />

                            <FormLabel htmlFor="isChecked">
                                Open your pool to accept new stakes
                            </FormLabel>
                        </InputGroup>
                    </HStack>
                </FormControl>

                {isChangingStaking && isMakingPoolTransaction && (
                    <Alert status="info" variant="left-accent">
                        <Spinner mx={2} />
                        <CloseButton
                            position="absolute"
                            right="8px"
                            top="8px"
                            onClick={() => {
                                setChangingStaking(false);
                                pool.transaction?.ack();
                            }}
                        />
                    </Alert>
                )}
            </Stack>

            <Box mt={10}>
                <Divider />
                <HStack mt={4} justify="space-between">
                    <FormLabel>
                        Decide to quit{' '}
                        <Tooltip
                            placement="bottom"
                            label="If you don't want to keep the pool active, it can be disabled with our help"
                            fontSize="small"
                            bg="black"
                            color="white"
                        >
                            <Icon
                                pb={1}
                                width={4}
                                height={4}
                                color="gray.600"
                                role="quit-icon"
                            />
                        </Tooltip>
                    </FormLabel>
                </HStack>
                <FormLabel>
                    If you would like to close the pool, please{' '}
                    <Link href="mailto:hello@cartesi.io" color="blue.400">
                        contact us
                    </Link>{' '}
                    and we will be glad to help you.
                </FormLabel>
            </Box>
        </Box>
    );
};

export default PoolSetting;
