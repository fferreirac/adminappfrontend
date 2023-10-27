//import { NextPage } from "next"
import { Box, Button, ButtonGroup, Flex, FormControl, FormErrorMessage, FormLabel, Input, Select, Spinner } from "@chakra-ui/react"
import { z } from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DevTool } from "@hookform/devtools"
import axios from "axios"
import { env } from "~/env.mjs"
import { useRouter } from "next/router"
import isLoading from "@tanstack/react-query"


const DOC_TYPES = ["RUC", "NIE", "Cédula", "Pasaporte", "CIF", "NIF", "DNI de Extrangero"] as const

// centralizar las validaciones con zod
const schema = z.object({
    firstname: z.string().min(3),
    lastname: z.string().min(3),
    email: z.string().email("Email inválido"),
    document_type: z.enum(DOC_TYPES),
    document_value: z.string().min(5)
})

export type Client = z.infer<typeof schema>

interface Props {
    clientId?: string
}

const ClientForm = ({ clientId }: Props) => {
    //console.log({ clientId })

    const {
        register,
        control,
        reset,
        getValues,
        handleSubmit,
        formState: { errors },
    } = useForm<Client>({
        resolver: zodResolver(schema),
        defaultValues: async () => {
            if (!clientId) return {}

            const { data } = await axios.get(`${env.NEXT_PUBLIC_BACKEND_BASE_URL}/clients/${clientId}`, { withCredentials: true })
            //console.log(data)
            return data.data
        },
    })

    const router = useRouter()

    const onSubmit = async (data: Client) => {
        const PARAMS = !!clientId ? `/${clientId}` : ""
        const res = await axios(
            `${env.NEXT_PUBLIC_BACKEND_BASE_URL}/clients${PARAMS}`,
            {
                method: !!clientId ? "PUT" : "POST",
                data,
                withCredentials: true
            },
        )
        reset()
        router.push("/clients")
    }

    if (isLoading) return (
        <Flex height={10} alignItems={"center"} justifyContent={"center"}>
            <Spinner alignSelf={"center"} colorScheme="red" />
        </Flex>

    )

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>

                <FormControl mb={5} isInvalid={!!errors.firstname}>
                    <FormLabel>Nombre</FormLabel>
                    <Input
                        type='text'
                        placeholder="nombre"
                        {...register("firstname")}
                    />
                    <FormErrorMessage>{errors.firstname?.message}</FormErrorMessage>
                </FormControl>

                <FormControl mb={5} isInvalid={!!errors.lastname}>
                    <FormLabel>Apellido</FormLabel>
                    <Input
                        type='text'
                        placeholder="apellido"
                        {...register("lastname")}
                    />
                    <FormErrorMessage>{errors.lastname?.message}</FormErrorMessage>
                </FormControl>

                <FormControl mb={5} isInvalid={!!errors.email} >
                    <FormLabel>Email</FormLabel>
                    <Input
                        type='email'
                        placeholder="Ingresa tu email"
                        {...register("email")}
                    />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <Flex>
                    <FormControl flex={4} mr={3}>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select placeholder="Seleccionar" {...register("document_type")}>
                            {DOC_TYPES.map(dt => (
                                <option key={dt} value={dt}>{dt}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl mb={5} isInvalid={!!errors.document_value} flex={4}>
                        <FormLabel>Documento</FormLabel>
                        <Input
                            type='text'
                            placeholder="tu documento"
                            {...register("document_value")}
                        />
                        <FormErrorMessage>{errors.document_value?.message}</FormErrorMessage>
                    </FormControl>
                </Flex>
                <ButtonGroup>
                    <Button colorScheme={"purple"} type={"submit"}>{!!clientId ? "Guardar Cambios" : "Crear"}</Button>
                    <Button colorScheme={"cyan"} onClick={() => router.back()}>Go Back</Button>
                </ButtonGroup>

            </form>
            <DevTool control={control} />
        </>
    )
}

export default ClientForm
