import { Card, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { Client } from './ClientForm'
import { useRouter } from 'next/router'

interface ClientFromDB extends Client {
    _id: string
}


interface Props {
    clients: ClientFromDB[]
}


const ClientsList = ({ clients }: Props) => {
    const router = useRouter();
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
                    onClick={() => router.push(`/clients/${c._id}`)}
                >
                    <Text>{c.firstname}</Text>
                </Card>
            ))}
        </Flex>
    )

}

export default ClientsList

