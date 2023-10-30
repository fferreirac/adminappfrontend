//import { NextPage } from "next"
import { Button, ButtonGroup, Flex, FormControl, FormErrorMessage, FormLabel, Input, Select, Spinner } from "@chakra-ui/react"
import { z } from 'zod'
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DevTool } from "@hookform/devtools"
import axios from "axios"
import { env } from "~/env.mjs"
import { useRouter } from "next/router"
import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"


const PAYMENT_METHOD_TYPES = [
    "Sin utilización Sist. Financiero",
    "Compensación de Deudas",
    "Tarjeta de débito",
    "Tarjeta de crédito",
    "Dinero electrónico",
    "Tarjeta prepago",
    "Endoso de títulos"] as const

const TIME_UNITS = z.enum(['Días', 'Meses', 'Años'])

const saleProductSchema = z.object({
    code: z.string(),
    name: z.string(),
    qty: z.number(),
    unit_price: z.number(),
    discount: z.number(),
    total: z.number()
})

const salePaymentMethodSchema = z.object({
    method: z.enum(PAYMENT_METHOD_TYPES),
    amount: z.number(),
    time_unit: TIME_UNITS,
    time_value: z.number(),
    //unit_price: z.number()
})

// centralizar las validaciones con zod
const saleSchema = z.object({
    operation_date: z.date(),
    total_amount: z.number().nonnegative(),
    client: z.string(),
    client_document: z.string(),
    products: z.array(saleProductSchema),
    payment_methods: z.array(salePaymentMethodSchema)
})

export type Sale = z.infer<typeof saleSchema>
type PaymentMethod = z.infer<typeof salePaymentMethodSchema>


interface Props {
    saletId?: string
}

const defaultPM: PaymentMethod = {
    method: "Tarjeta de débito",
    amount: 5000,
    time_unit: "Días",
    time_value: 0,
}

const SaleForm = ({ saletId }: Props) => {
    const [startDate, setStarDate] = useState(new Date)
    const {
        register,
        control,
        reset,
        setValue,
        handleSubmit,
        formState: { errors, isLoading },
    } = useForm<Sale>({
        resolver: zodResolver(saleSchema),
        defaultValues: async () => {
            if (!saletId) return { payment_methods: [defaultPM] }

            const { data } = await axios.get(`${env.NEXT_PUBLIC_BACKEND_BASE_URL}/sales/${saletId}`, { withCredentials: true })
            return data.data
        },
    })

    const { fields, append, remove, move, insert, swap, prepend } = useFieldArray({
        control,
        name: "payment_methods"
    })

    //console.log({ fields })

    const router = useRouter()

    const onSubmit = async (data: Sale) => {
        const PARAMS = !!saletId ? `/${saletId}` : ""
        const res = await axios(
            `${env.NEXT_PUBLIC_BACKEND_BASE_URL}/sales${PARAMS}`,
            {
                method: !!saletId ? "PUT" : "POST",
                data,
                withCredentials: true
            },
        )
        reset()
        router.push("/")
    }

    if (isLoading) return (
        <Flex height={10} alignItems={"center"} justifyContent={"center"}>
            <Spinner alignSelf={"center"} colorScheme="red" />
        </Flex>

    )

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>

                <FormControl mb={5} isInvalid={!!errors.client_document}>
                    <FormLabel>Documento del Cliente</FormLabel>
                    <Input
                        type='text'
                        placeholder="nombre"
                        {...register("client_document")}
                    />
                    <FormErrorMessage>{errors.client_document?.message}</FormErrorMessage>
                </FormControl>

                <FormControl mb={5} isInvalid={!!errors.operation_date}>
                    <FormLabel>Fecha de la Operación</FormLabel>
                    <DatePicker
                        selected={startDate}
                        ref={register("operation_date").ref}
                        onChange={(date: Date) => setValue("operation_date", date)} />
                    <FormErrorMessage>{errors.operation_date?.message}</FormErrorMessage>
                </FormControl>
                <Flex flexDir={"column"} mb={4}>
                    {fields.map((field, index) => (<Flex gap={3}>
                        <FormControl flex={7}>
                            <FormLabel>Método</FormLabel>
                            <Select
                                placeholder="Seleccionar"
                                {...register(`payment_methods.${index}.method`)}
                            >
                                {PAYMENT_METHOD_TYPES.map((method) => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl flex={4} mb={5} isInvalid={!!errors?.payment_methods}>
                            <FormLabel>Importe</FormLabel>
                            <Input
                                type='text'
                                placeholder='0'
                                {...register(`payment_methods.${index}.amount`)}
                            />
                            {/* <FormErrorMessage>{errors.document_value?.message}</FormErrorMessage> */}
                        </FormControl>

                        <FormControl flex={2} mb={5} isInvalid={!!errors?.payment_methods}>
                            <FormLabel>Plazo</FormLabel>
                            <Input
                                type='number'
                                placeholder="Plazo"
                                {...register(`payment_methods.${index}.time_value`)}
                            />
                            {/* <FormErrorMessage>{errors.document_value?.message}</FormErrorMessage> */}
                        </FormControl>

                        <FormControl flex={4}>
                            <FormLabel>Período</FormLabel>
                            <Select placeholder="Seleccionar"
                                {...register(`payment_methods.${index}.time_unit`)}
                            >
                                {Object.keys(TIME_UNITS.Enum).map((unit) => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </Select>
                        </FormControl>
                    </Flex>))}
                    <Button onClick={() => append(defaultPM)}>Nuevo Método</Button>
                </Flex>
                <ButtonGroup>
                    <Button colorScheme={"purple"} type={"submit"}>{!!saletId ? "Guardar Cambios" : "Crear"}</Button>
                    <Button colorScheme={"cyan"} onClick={() => router.back()}>Go Back</Button>
                </ButtonGroup>

            </form>
            <DevTool control={control} />
        </>
    )
}

export default SaleForm
