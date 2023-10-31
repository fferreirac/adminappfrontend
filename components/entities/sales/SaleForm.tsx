import { DeleteIcon, SearchIcon } from "@chakra-ui/icons"
import { Button, ButtonGroup, Divider, Flex, FormControl, FormErrorMessage, FormLabel, Heading, IconButton, Input, Select, Spinner } from "@chakra-ui/react"
import { z } from 'zod'
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DevTool } from "@hookform/devtools"
import axios from "axios"
import { env } from "~/env.mjs"
import { useRouter } from "next/router"
import { useState } from "react"
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
    unit_price: z.number().optional(),
    discount: z.number().optional(),
    total: z.number()
})

const salePaymentMethodSchema = z.object({
    method: z.enum(PAYMENT_METHOD_TYPES),
    amount: z.number(),
    time_unit: TIME_UNITS,
    time_value: z.number(),
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
type ProductForState = z.infer<typeof saleProductSchema>

interface Product extends ProductForState {
    supplier_cost: number
    micro: number
    iva: number
    salvament_margin: number
    profit_margin: number
}


interface Props {
    saletId?: string
}

const defaultPM: PaymentMethod = {
    method: "Tarjeta de débito",
    amount: 0,
    time_unit: "Meses",
    time_value: 0,
}

const defaultProduct: ProductForState = {
    code: "",
    name: "",
    qty: 1,
    total: 0
}

const SaleForm = ({ saletId }: Props) => {
    const [startDate, setStarDate] = useState(new Date)
    const {
        register,
        control,
        reset,
        setValue,
        getValues,
        handleSubmit,
        formState: { errors, isLoading },
    } = useForm<Sale>({
        resolver: zodResolver(saleSchema),
        defaultValues: async () => {
            if (!saletId) return {
                payment_methods: [defaultPM],
                products: [defaultProduct]
            }

            const { data } = await axios.get(`${env.NEXT_PUBLIC_BACKEND_BASE_URL}/sales/${saletId}`, { withCredentials: true })
            return data.data
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "payment_methods"
    })

    //lo mismo de antes pero renombrado para evitar colision
    const { fields: products, append: addProduct, remove: removeProduct } = useFieldArray({
        control,
        name: "products"
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
                {/* datos basicos */}
                <FormControl mb={5} isInvalid={!!errors.client_document}>
                    <FormLabel>Documento del Cliente</FormLabel>


                    <Flex gap={1}>
                        <IconButton
                            aria-label="Search database"
                            icon={<SearchIcon />}
                            onClick={async () => {
                                const document = getValues('client_document');
                                if (!document) return

                                const { data } = await axios.get(
                                    `${env.NEXT_PUBLIC_BACKEND_BASE_URL}/client/${document}`,
                                    { withCredentials: true }
                                )
                                setValue(`client`, data.data._id);

                            }}
                        />
                        <Input
                            type='text'
                            placeholder="documento"
                            {...register("client_document")}
                        />
                    </Flex>

                    <FormErrorMessage>{errors.client_document?.message}</FormErrorMessage>
                </FormControl>

                <FormControl mb={5} isInvalid={!!errors.operation_date} >
                    <FormLabel>Fecha de la Operación</FormLabel>
                    <Input type="date" {...register("operation_date")} />
                    {/* <DatePicker
                        selected={startDate}
                        ref={register("operation_date").ref}
                        onChange={(date: Date) => setValue("operation_date", date)} /> */}
                    <FormErrorMessage>{errors.operation_date?.message}</FormErrorMessage>

                </FormControl>

                {/* PRODUCTOS */}
                <Flex alignItems={"center"} justifyContent={"space-between"} mt={8}>
                    <Heading size={"lg"}>Productos</Heading>
                    <Button
                        size={"xs"}
                        fontSize={"1rem"}
                        lineHeight={"1rem"}
                        py={4}
                        colorScheme="blue"
                        onClick={() => addProduct(defaultProduct)}
                    >
                        Agregar
                    </Button>
                </Flex>

                <Divider mb="3" mt={"2"} />

                <Flex flexDir={"column"} mb={4} >
                    {products.map((field, index) => (
                        <Flex gap={3} alignItems={"flex-end"} mb={5}>
                            <IconButton
                                aria-label="Search database"
                                icon={<SearchIcon />}
                                onClick={async () => {
                                    const code = getValues(`products.${index}.code`);
                                    //console.log({ code })
                                    if (!code) return

                                    const { data } = await axios.get(
                                        `${env.NEXT_PUBLIC_BACKEND_BASE_URL}/products/${code}`,
                                        { withCredentials: true }
                                    )
                                    const product: Product = data.data;
                                    if (!!product) {
                                        const { supplier_cost, micro, iva, profit_margin, salvament_margin } = product
                                        setValue(`products.${index}`, {
                                            code: code,
                                            name: product.name,
                                            qty: 1,
                                            total: supplier_cost as number
                                        })

                                        /* calculos de factura  */
                                        const ivaAmount = iva * supplier_cost
                                        const baseCost = micro + supplier_cost
                                        const minimunCost = baseCost / (1 - salvament_margin)
                                        const finalPrice = +(minimunCost / (1 - profit_margin)).toFixed(3)
                                        console.log({ finalPrice })
                                    } else {
                                        console.log("No existe producto con ese código")
                                        setValue(`products.${index}`, {
                                            code: code,
                                            name: "product no existe",
                                            qty: 0,
                                            total: 0
                                        })
                                    }
                                }}
                            />
                            <FormControl flex={2}>
                                {index === 0 && <FormLabel>Código</FormLabel>}
                                <Input
                                    type="text"
                                    placeholder="Código"
                                    {...register(`products.${index}.code`)}
                                />
                            </FormControl>

                            <FormControl flex={6}>
                                {index === 0 && <FormLabel>Denominación</FormLabel>}
                                <Input
                                    type="text"
                                    placeholder="Denominación"
                                    {...register(`products.${index}.name`)}
                                    disabled
                                />
                            </FormControl>

                            <FormControl flex={2}>
                                <Flex alignItems={"center"} justifyContent={"space-between"}>
                                    {index === 0 && <FormLabel>Cantidad</FormLabel>}
                                    <Input type="number" {...register(`products.${index}.qty`)} />
                                    {index > 0 && (<DeleteIcon onClick={() => removeProduct(index)} color="red.500" _hover={{ color: "red.700" }} cursor={"pointer"} ml={2} />)}
                                </Flex>
                            </FormControl>
                        </Flex>))}
                </Flex>

                {/* SALE */}
                <Flex alignItems={"center"} justifyContent={"space-between"} mt={8}>
                    <Heading size={"lg"}>Forma de Pago</Heading>
                    <Button
                        size={"xs"}
                        fontSize={"1rem"}
                        lineHeight={"1rem"}
                        py={4}
                        colorScheme="blue"
                        onClick={() => append(defaultPM)}
                    >
                        Agregar
                    </Button>
                </Flex>

                <Divider mb="3" mt={"2"} />

                <Flex flexDir={"column"} mb={4}>

                    {fields.map((field, index) => (<Flex gap={3} alignItems={"flex-end"} mb={5}>
                        <FormControl flex={7}>
                            {index === 0 && <FormLabel>Método</FormLabel>}
                            <Select
                                placeholder="Seleccionar"
                                {...register(`payment_methods.${index}.method`)}
                            >
                                {PAYMENT_METHOD_TYPES.map((method) => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl flex={4} isInvalid={!!errors?.payment_methods}>
                            {index === 0 && <FormLabel>Importe</FormLabel>}
                            <Input
                                type='text'
                                placeholder='0'
                                {...register(`payment_methods.${index}.amount`)}
                            />
                        </FormControl>

                        <FormControl flex={2} isInvalid={!!errors?.payment_methods}>
                            {index === 0 && <FormLabel>Plazo</FormLabel>}
                            <Input
                                type='number'
                                placeholder="Plazo"
                                {...register(`payment_methods.${index}.time_value`)}
                            />
                        </FormControl>

                        <FormControl flex={4}>
                            <Flex alignItems={"center"} justifyContent={"space-between"} >
                                {index === 0 && <FormLabel>Período</FormLabel>}

                                <Select placeholder="Seleccionar"
                                    {...register(`payment_methods.${index}.time_unit`)}
                                >
                                    {Object.keys(TIME_UNITS.Enum).map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </Select>
                                {index > 0 && (<DeleteIcon onClick={() => remove(index)} color="red.500" _hover={{ color: "red.700" }} cursor={"pointer"} ml={2} />)}

                            </Flex>
                        </FormControl>
                    </Flex>))}
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
