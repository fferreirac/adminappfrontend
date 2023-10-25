import { NextPage } from "next"
import { Card, Container, Heading } from "@chakra-ui/react"
import ClientForm from "components/entities/clients/ClientForm"

const NewClient: NextPage = () => {
    return (
        <Container mt={8}>
            <Card p={4}>
                <Heading textAlign={"center"} mb={6}>Nuevo Cliente</Heading>
                <ClientForm />
            </Card>
        </Container>
    )
}
export default NewClient