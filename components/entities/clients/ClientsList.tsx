import { Card, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { Client } from './ClientForm'
//import { Client } from '~/pages/clients/new'

interface ClientFromDB extends Client {
    _id: string
}


interface Props {
    clients: ClientFromDB[]
}

const ClientsList = ({ clients }: Props) => {
    return (
        <Flex flexDirection={"column"} gap={2}>
            {clients.map(c => (
                <Card
                    key={c._id}
                    py={2}
                    px={4}
                    //p={"0.5rem 1rem"} 
                    cursor={"pointer"}
                    _hover={{
                        bgColor: "gray.300",
                        color: "#222",
                        transition: ".5s background-color ease-out"
                    }}
                >
                    <Text>{c.firstname}</Text>
                </Card>
            ))}
        </Flex>
    )
}

export default ClientsList