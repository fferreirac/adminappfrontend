import { NextPage } from "next"
import { useRouter } from "next/router"
import { Button, ButtonGroup, Card, Container, FormControl, FormErrorMessage, FormLabel, Heading, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { env } from "~/env.mjs";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod'

// centralizar las validaciones con zod
const schema = z.object({
    email: z.string().email("Email inválido"),
    code: z.string().length(6, "Elcódigo debe tener 6 caracteres")
});

type FieldValues = z.infer<typeof schema> //lo inferimos ya que lo de abajo no funciono

//pasar type de datos en el user form
// interface FieldValues {
//     email: string,
//     code: string
//}


const Login: NextPage = () => {
  const { 
    register, 
    getValues, 
    handleSubmit, // para validar el formulario
    formState: {errors},
 } = useForm<FieldValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'ferreiradeveloper@gmail.com', code: '227777' },
}); // react-hook-form  , le pasamos la interface de tipos y dentro zodResolver con el schema

  const router = useRouter();
  
  const onSubmit = () => {
    const { email, code } = getValues();
    console.log({email, code});
    axios
        .post(`${env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login/${email}`,
        { code }, 
        { withCredentials: true }
        )
        .then(({data})=>{

            router.push("/");
        })
        .catch((error) => console.log(error))
  }  
  const onError = () => {console.log(errors);}



  return (
    <Container marginTop={10}>
        <Heading textAlign={"center"}>Iniciar Sesión</Heading>
        <Card padding={3} maxWidth={""}>
            <form onSubmit={handleSubmit(onSubmit, onError)} /* le pasamos al formulario el onSubmit */> 
                <FormControl marginBottom={5} isInvalid={!!errors.email} /*esto es para que funciones el menjaje de erorr */>
                    <FormLabel>Email address</FormLabel>
                    <Input 
                        type='email' 
                        placeholder="Ingresa tu email"
                        {...register("email")}
                    />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.code}>
                    <FormLabel>Código</FormLabel>
                    <Input type='number' placeholder="Ingresa tu Código" {...register("code")}/>
                    <FormErrorMessage>{errors.code?.message}</FormErrorMessage>
                </FormControl>

                <ButtonGroup marginTop={8} justifyContent="center">
                    <Button type="submit" /* para completar lo de onSubmit*/>Iniciar Sesión</Button>{" "}                         
                     
                    <Button 
                        onClick={() => { 
                         const email = getValues('email');
                         axios.post(`${env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login/${email}/code`)
                         .then(console.log)
                         .catch(console.log);
                    }}>Quiero un Código</Button>
                </ButtonGroup>
                
            </form>    
        </Card>        
    </Container>
  )
}

export default Login



