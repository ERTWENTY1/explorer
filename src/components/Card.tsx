// Copyright (C) 2022 Cartesi Pte. Ltd.

// This program is free software: you can redistribute it and/or modify it under
// the terms of the GNU General Public License as published by the Free Software
// Foundation, either version 3 of the License, or (at your option) any later
// version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
// PARTICULAR PURPOSE. See the GNU General Public License for more details.

import {
    Avatar,
    Box,
    Button,
    Heading,
    Stack,
    StackProps,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { MouseEventHandler, ReactElement } from 'react';

export interface CardProps extends StackProps {
    id?: string;
    buttonText?: string | ReactElement;
    icon?: ReactElement;
    iconBg?: string | (string & {});
    subtitle?: string;
    title: string;
    onButtonClick?: MouseEventHandler<HTMLButtonElement>;
}

export const Card = ({
    id,
    buttonText,
    onButtonClick,
    icon,
    iconBg,
    subtitle,
    title,
    ...stackProps
}: CardProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    return (
        <Stack
            id={id}
            bg={bg}
            borderRadius={6}
            spacing={10}
            py={8}
            px={8}
            w={{ base: '100%' }}
            direction={{ base: 'column', lg: 'row' }}
            justifyContent={{ base: 'flex-start', lg: 'space-between' }}
            alignItems={{ base: 'center', lg: 'flex-start' }}
            {...stackProps}
        >
            <Stack
                direction={{ base: 'column', lg: 'row' }}
                alignItems={['center']}
                px={4}
            >
                <Avatar w={14} h={14} bg={iconBg} icon={icon} mr={1} />
                <Box textAlign={{ base: 'center', lg: 'left' }}>
                    <Heading as="h3" size="sm" mb={0}>
                        {title}
                    </Heading>
                    <Text>{subtitle}</Text>
                </Box>
            </Stack>
            <Box px={1}>
                <Button
                    ml={{ base: 0, lg: 2 }}
                    colorScheme="blue"
                    onClick={onButtonClick}
                    fontWeight={500}
                    isFullWidth
                    h={{ base: 12, lg: 14 }}
                    w="16rem"
                >
                    {buttonText}
                </Button>
            </Box>
        </Stack>
    );
};
