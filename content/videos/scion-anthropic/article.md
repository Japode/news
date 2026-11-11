---
status: rascunho, aguardando a aprovação do Alexandre
---
O Scion é o controle de versão que a Anthropic, a empresa que cria o Claude, construiu para o seu repositório principal quando o Git deixou de dar conta: em setembro de 2026, entravam ali [mais de 30 mil mudanças de código por dia](https://www.anthropic.com/engineering/redesigning-source-control). No Scion, a história fica no servidor, e a máquina de quem programa baixa só o que precisa. Tudo o que está aqui vem do post da Anthropic ["Redesigning source control at Anthropic"](https://www.anthropic.com/engineering/redesigning-source-control), de 13 de outubro de 2026, atualizado em 15 de outubro.

## Trinta mil por dia

Em maio, o repositório recebia [cerca de 2.500 merges por dia; quatro meses depois, mais de 30 mil](https://www.anthropic.com/engineering/redesigning-source-control). A diferença vem dos agentes de inteligência artificial escrevendo código, que não param.

A própria Anthropic resume o problema numa frase: o gargalo agora é toda a infraestrutura feita na escala humana, ou seja, controle de versão, build e integração contínua. Escrever código deixou de ser a parte lenta.

## Feito para outro mundo

O Git nasceu [em 2005](https://www.anthropic.com/engineering/redesigning-source-control), escrito por Linus Torvalds para o kernel do Linux. A ideia central é que cada pessoa tenha a história inteira no próprio computador, trabalhe offline e sincronize quando quiser.

A Anthropic, porém, usava o Git de um jeito centralizado: um único repositório gigante, com a integração contínua puxando código o tempo todo. Nas palavras do post, as propriedades que fazem o Git excelente para o trabalho distribuído e offline estavam atrapalhando a escala.

## Onde o Git quebrou

Só a história do branch principal tinha [quase 100 GB](https://www.anthropic.com/engineering/redesigning-source-control). A integração contínua fazia cerca de 25 milhões de checkouts por dia; se cada um baixasse tudo, seriam mais de 600 petabytes de tráfego por dia.

O Git tem respostas para isso: clone raso, clone parcial e sparse checkout. A Anthropic usou todas e chegou a manter centenas de espelhos internos do Git só para aguentar a carga. Ainda assim, quanto mais rápido entravam as mudanças, mais difícil ficava manter tudo de pé.

## O servidor no centro

O Scion inverte a lógica: quem guarda e trabalha a história é o servidor. Commit, merge, rebase, blame e diff acontecem lá, e, como diz a Anthropic, não sobra nada para dar push.

A unidade de trabalho deixa de ser o commit e passa a ser o changeset, uma entrada num write-ahead log que guarda só os arquivos que mudaram. Os metadados ficam no Spanner, o banco do Google, e o conteúdo num armazenamento em nuvem; mover um branch é uma única troca atômica numa linha do banco. Para responder a blame e histórico, o servidor calcula o que a Anthropic chama de derived data, dados derivados de cada changeset.

## Só o que você precisa

A máquina de quem trabalha não baixa mais o repositório inteiro. O cliente pede só as árvores e os arquivos de que precisa, e o checkout pode ser virtual: o arquivo aparece no disco quando alguém precisa dele.

No caminho há três camadas de cache: um daemon em cada máquina, um cache por região e, só no fim, o servidor. Cada camada responde sozinha a [mais de 99% dos pedidos](https://www.anthropic.com/engineering/redesigning-source-control), e não existe packfile para manter.

## Sete pessoas, cinco meses

A infraestrutura do Scion ficou [200 vezes menor que os antigos espelhos do Git](https://www.anthropic.com/engineering/redesigning-source-control), em processador e memória. Os checkouts de testes e de pesquisa ficaram duas ordens de grandeza mais rápidos, segundos em vez de minutos, e a integração contínua ganhou 25% de capacidade.

O trabalho foi feito por [uma equipe de 7 pessoas, em 5 meses](https://www.anthropic.com/engineering/redesigning-source-control), enquanto os merges diários se multiplicavam por 10. Junto veio o Antique, uma nova ferramenta de revisão de código. O Claude também ajudou: uma versão do pipeline de importação reescrita por ele usava 20 vezes menos memória e era 4 vezes mais rápida. Hoje, instâncias do Claude que a Anthropic chama de superfans acompanham, cada uma, um componente do sistema.

## Nos ombros de gigantes

A Anthropic dá o crédito ao Piper, do Google, e ao Sapling, da Meta, em especial ao Mononoke, o servidor do Sapling, que criou o modelo de dados Bonsai e muitas das técnicas usadas no Scion.

E o Git continua onde está. Segundo a Anthropic, o Scion não é, de jeito nenhum, um substituto do Git para uso geral: foi feito para monorepos realmente enormes. O plano é compartilhar as ideias, para que outras equipes levem parte delas para o próprio Git.
