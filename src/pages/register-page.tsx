import { Link, useNavigate } from "@tanstack/react-router"
import { Cloud, Lock, User, UserCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { useRegisterMutation } from "@/api/hooks"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z
  .object({
    username: z.string().min(3, "Debe tener al menos 3 caracteres"),
    password: z.string().min(6, "Debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirma la contraseña"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending, error } = useRegisterMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await mutateAsync({ username: values.username, password: values.password })
    await navigate({ to: "/app/dashboard" })
  })

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6 py-12">
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-secondary/10 blur-[120px]" />
      <Card className="w-full max-w-md border border-white/5 bg-surface-container-high/70 backdrop-blur-xl">
        <CardHeader>
          <div className="mb-2 flex justify-center">
            <div className="rounded-xl bg-surface-container-high p-3">
              <Cloud className="size-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Crea tu cuenta</CardTitle>
          <CardDescription>
            Únete a CloudBox para gestionar tus archivos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-9"
                  {...form.register("username")}
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <UserCheck className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  className="pl-9"
                  {...form.register("confirmPassword")}
                />
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            {error && (
              <p className="text-xs text-destructive">{error.message}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              onClick={onSubmit}
            >
              {isPending ? "Creando..." : "Crear cuenta"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              className="text-primary underline-offset-4 hover:underline"
              to="/login"
            >
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
