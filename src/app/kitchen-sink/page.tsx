"use client";

import { toast } from "sonner";
import { ColorModeToggle } from "@/components/color-mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function KitchenSinkPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Kitchen sink — primitivos ui</h1>
          <p className="text-sm text-text-secondary">Rota temporária para inspeção visual. Apagar depois.</p>
        </div>
        <ColorModeToggle className="rounded-control border border-border-default bg-surface-panel px-3 py-2 text-sm text-text-primary shadow-panel" />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-caps text-text-tertiary uppercase">Card</h2>
        <Card>
          <CardHeader>
            <CardTitle>Turma de Estivagem Avançada</CardTitle>
            <CardDescription>12 alunos matriculados — progresso médio de 64%.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">
              Conteúdo qualquer dentro do card, usando os tokens de texto padrão.
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">Abrir turma</Button>
            <Button size="sm" variant="outline">
              Ver relatório
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-caps text-text-tertiary uppercase">Badge</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-caps text-text-tertiary uppercase">Table</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Maria Silva</TableCell>
              <TableCell>Estivagem Avançada</TableCell>
              <TableCell>
                <Badge>Ativo</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>João Souza</TableCell>
              <TableCell>Segurança Portuária</TableCell>
              <TableCell>
                <Badge variant="secondary">Pendente</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-caps text-text-tertiary uppercase">Tabs</h2>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-sm text-text-secondary">
            Conteúdo da aba Visão geral.
          </TabsContent>
          <TabsContent value="students" className="text-sm text-text-secondary">
            Conteúdo da aba Alunos.
          </TabsContent>
          <TabsContent value="settings" className="text-sm text-text-secondary">
            Conteúdo da aba Configurações.
          </TabsContent>
        </Tabs>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-caps text-text-tertiary uppercase">Dialog</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Abrir diálogo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir curso</DialogTitle>
              <DialogDescription>Essa ação não pode ser desfeita.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button variant="secondary">Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-caps text-text-tertiary uppercase">Select</h2>
        <Select defaultValue="draft">
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Status do curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="archived">Arquivado</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-caps text-text-tertiary uppercase">Separator</h2>
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span>Item A</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Item B</span>
        </div>
        <Separator />
        <Input placeholder="Campo de exemplo abaixo do separador" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-caps text-text-tertiary uppercase">Skeleton</h2>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>

      <section className="flex flex-col gap-3 pb-16">
        <h2 className="text-sm font-medium tracking-caps text-text-tertiary uppercase">Sonner (toast)</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => toast("Notificação padrão", { description: "Sem tom específico." })}>
            Toast padrão
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toast.success("Curso publicado com sucesso")}
          >
            Toast de sucesso
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.error("Falha ao publicar o curso")}
          >
            Toast de erro
          </Button>
        </div>
      </section>
    </div>
  );
}
