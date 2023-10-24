import { NextPage } from "next"
import { Button, ButtonGroup, Card, Container, FormControl, FormErrorMessage, FormLabel, Heading, Input } from "@chakra-ui/react";
import { z }from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DevTool } from "@hookform/devtools";

const DOC_TYPES = ["RUC","NIE","Cédula","Pasaporte","CIF","NIF"] as const;

// centralizar las validaciones con zod
const schema = z.object({
    firstname: z.string().min(3),
    lastname: z.string().min(3),
    email: z.string().email("Email inválido"),
    document_type: z.enum(DOC_TYPES), 
    document_value: z.string().min(5), 
    code: z.string().length(6, "Elcódigo debe tener 6 caracteres")
});

type FieldValues = z.infer<typeof schema> //lo inferimos ya que lo de abajo no funciono

const NewClient: NextPage = () => {
  const { 
    register, 
    control, // property que destructuramos del useForm y se la pasamos a la devTool
    getValues, 
    handleSubmit, // para validar el formulario
    formState: {errors},
 } = useForm<FieldValues>({
    resolver: zodResolver(schema),
    //defaultValues: {},
});

//const NewClient: NextPage = () => {
  return (
    <Container marginTop={8}>
        <Card padding={4}>
            <Heading textAlign={"center"} marginBottom={6}>Nuevo Cliente</Heading>            
        
            <form action="">
                <FormControl marginBottom={5} isInvalid={!!errors.email} /*esto es para que funciones el menjaje de erorr */>
                    <FormLabel>Email</FormLabel>
                        <Input 
                            type='email' 
                            placeholder="Ingresa tu email"
                            {...register("email")}
                        />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <Button colorScheme="purple" onClick={ ()=> {}}>
                    Create
                </Button>
            </form>        

            <DevTool control={control} /> {/* set up the dev tool */}
            </Card>
    </Container>
  )
}

export default NewClient
