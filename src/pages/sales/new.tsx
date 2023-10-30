import { NextPage } from "next"
import { Card, Container, Heading } from "@chakra-ui/react"
import SaleForm from "components/entities/sales/SaleForm"

const NewClient: NextPage = () => {
    return (
        <Container mt={8}>
            <Card p={4}>
                <Heading textAlign={"center"} mb={6}>Nueva Venta</Heading>
                <SaleForm />
            </Card>
        </Container>
    )
}
export default NewClient