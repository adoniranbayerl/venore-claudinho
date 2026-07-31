Estou criando um tema e aproveitando para pegar alguns issues.

## Issues
### Temas

1. Venore Slime: Precisamos aplicar efeito de transição no sidebar. Hoje quando ele colapsa, a animação dá uma travadinha; às vezes muito rapido, às vezes travando. Fiz uma cópia do Venore Slime para criar o tema Menonitas Classic. É apenas uma versão com outras cores, o problema do sidebar persiste aqui.
2. As configurações estéticas do brand deveriam estar no tema, não em settings. Ex: tamanho da brandlogo.
3. Como poderíamos criar um subsistema em temas para troca de cores dentro da plataforma? Seria interessante o admin/designer poder escolher as paletas de cores e até mesmo salvá-las dentro do subsistema - podendo escolher entre paletas salvas.
4. No tema Venore Slime, poderíamos criar uma settings para escolher comportamento do header e sidebar.
5. Acredito que devemos ter tokens para o background e foreground de cada slot. Hoje temos do sitebar, header e app (content), mas não temos para o footer.

### Home Page
1. Quando crio um conteúdo com o caminho /home, ele se torna a página inicial. Esse é comportamento esperado
2. Porém, a página não rederiza o seu conteúdo quando está como /home

### Breadcrumbs
1. Breadcrumbs não atualiza quando uma nova rota é carregada na url, só atualiza quando troco entre main nav e admin nav. Aparentemente ela dá reload na shell toda quando troca entre os navs, correto?


### Content Management System (Aba conteúdos, vamos alterar o nome para Editorial)
1. Páginas de tipos de conteúdo, contegorias, conteúdos e navegação devem seguir o mesmo padrão:
Botões de criação de novo (Novo tipo de conteúdo, Nova categoria, Novo conteúdo, Nova navegação) devem vir na parte superior da página, logo após o título e descrição. Esses botões devem ser evidentes.
2. Na sequencia, vamos usar uma table do shadcn para organizar o conteúdo. Essa tabela deve conter filtro quando possível e também campo para busca por nome.
3. Além disso, no caso dos Conteúdos, prcisamos de um botão para editar e outro para ver a página ao vivo
4. Também vamos precisar de um select para definir o estado do conteúdo
5. Sobre os estados:
    - Rascunho (o primeiro estado de um conteúdo, quando ele está sendo construido)
    - Publicado (o estado quando o conteúdo está disponível para ser consumido pelo site)
    - Agendado (o agendamento pode publicar e/ou arquivar um conteúdo no prazo determinado)
    - Arquivado (Arquivado é quando o conteúdo sai do estado publicado via agendamento ou pelo editor/admin/superadmin )

6. Apenas conteúdos arquivados podem ser deletados definitivamente (com confirmação)
7. Conteúdos devem ter um campo de privacidade, assim o editor e superiores podem definir quem pode ver aquele conteúdo. Sobre a privacidade:
    - Conteúdo aberto para qualquer visitante (não logados e logados)
    - Conteúdo fechado (apenas logados)
    
Dúvida: Ainda estou em dúvida com relação a tipos de conteúdo e categorias, se não são redundantes. Em teoria, deveriam ser dois tipos de taxonomia que se complementam. Estou pensando seriamente em alterar tipos de conteúdo para "tags" e liberar mais de uma por conteúdo. Categorias hoje define a url.

8. Tanto em categorias quanto em "tipos de conteúdo", deve dar a informação de quantidade de conteúdos em cada um. Podemos elaborar um dashboard bem informativo para saber o que acontece em cada. Incluindo acesso e etc.

9. Acesso! Esse é um ponto interessante, poderiamos ter uma forma de contador de visitas em cada conteúdo. 

### Media Management System (Mídia)
1. Criamos categorias, mas precisamos de um sistema mais elaborado para mídia. Talvez um sistema de pastas - tudo o que for avatar, apenas o autor tem acesso e no blob vai tudo para uma pasta chamada avatar ou profilePic. Imagens de plugins (como Academy) também tem sua pasta, e categoria. Arquivos para conteúdos em geral herdam as categorias onde forem consumidos.
2. Pensando assim, não enviamos mais mídia e deixamos elas orfãs no Mídia. Os uploads já são feitos dentro do contexto onde vão ser usadas e nesse upload já se define o status dessa midia (que pode ser audio, pdf, arquivos office, imagem, basicamente consumíveis pela plataforma)
3. Sobre os status:
    - Público (pode ser consumido em qualquer conteúdo e aula por editores e superiores)
    - Restrito (pode ser consumido apenas no contexto de origem)
    - Privado (no caso dos avatares, só pode ser visto pelo usuário que fez upload. )


### Academy
1. As aulas não devem mais depender de conteúdos pré-publicados. Embora o subsystem possa usar do page-builder, sistema de categorias e as futuras tags, os conteúdos devem ser construídos no contexto do academy. 
2. As aulas não devem contar como Contéudo, elas não devem aparecer publicamente FORA do contexto do Academy
3. Sobre o status do Curso e aula
    - Público (curso público que qualquer usuário pode se matricular)
    - Restrito (apenas pessoas autorizadas podem acessar (matrícula é feita pelo admin ou moderador))
    - Rascunho (curso visivel apenas para o autor, editores, moderadores e admin)

4. O Curso como produto final deve ter essa rota e experiência
- Aluno clica no curso e entra numa espécie de dashboard do curso.
- Nesse dahsboard, vamos ter um progress bar mostrando o quanto do curso ele concluiu
- Um card de agenda (similar ao que criamos dos aniversariantes), nessa agenda deve mostrar todas as atividades com prazos de entrega (se houver) e assinalar as que já foram feitas
- Um card de aproveitamento das aulas, mostrando um gráfico de pontuação de cada aula (pontuação feita com entrega de atividades, leituras, quiz e etc)
- Uma tabela com as aulas. Aulas concluidas sinalizadas, aulas que precisam de atenção também sinalizadas, aulas fechadas muted. 

Na página da aula o aluno deve se deparar
- Um rota de leitura. A ideia é que cada capítulo seja uma página, assim o aluno não bate o olho com muito texto de uma vez... ele vai progredindo pela rota.
- Dentro da rota de leitura, o professor pode linkar material complementar (audio, vídeo, pdf, etc).
- Ao final de cada capítulo, o aluno deve satisfazer as requisições do capítulo para avançar. Algumas ele deve assinalar que fez (por exmeplo, um exercicio vocal), outras podem ser um quiz. 

Além da rota de leitura, quero um card com todo o material complementar separado para acesso rápido e outro com todas as atividades para acesso rapido.


Sobre Papéis e Permissões
Vamos ter o nome interno do sistema, mas podemos criar "aliases" para mostrar no site.

- Overlord - é o Superadmin, o dono do site ou quem instalou a bagaça toda. Tem acesso geral à tudo. 
- Administrador - Pode comandar uma ou mais seções do site (Por exemplo, Administrador do Academy, ou o Administrador Editorial)
- Editor - Modera e administra o Editorial, pode ser vinculado à uma categoria especifica (Por exemplo, Editor de Novidades), ele vai coordenar os autores. Ele não tem acesso as categorias que ele não pode trabalhar. As categorias devem ser atribuidas a ele
- Autor - Criar e publica nas categorias atribuidas. Não pode publicar, apenas criar drafts. 
- Membro - Consumidor do site logado
- Fora esses papeis, nosso sistema já permite criar roles personalizadas. Mantenha assim.

### Registro de usuários
- O subsistema de registro que deveria ser aprovado pelo Admin não está funcionando, os usuários estão sendo registrados direto.


### Plugins e Temas
- Precisamos ter a habilidade de instalar e desinstalar plugins dentro do site.
- Instalar via .zip
- Desinstalar deve perguntar se é para limpar tudo (inclui banco de dados) ou apenas apaga da pasta plugins 

### Subsistema de importar e exportar conteúdo
- Esse sistema deve servir para o CMS e o MMS
- Academy deve criar seu próprio subsistema

Esse sistema deve servir para quando eu querer migrar o site.


### Blogroll
Quandoa acessar a rota de uma categoria, por exemplo /cursos. Devve mostrar como blog todo o conteúdo daquela cateogira, respeitando o status.

### Ainda sobre blogroll
- Um caso real que estou planejando. O Recursos Humanos da empresa publica para o público externo e interno diversas vagas de emprego com frequencia. 
O que eu quero
- Embora o site Fem Colaborador vai ser um site fechado para colaboradores (membros), quero deixar uma blogroll "Vagas de Emprego" público para acesso de quem quiser. 




