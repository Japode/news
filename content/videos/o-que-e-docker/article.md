---
status: rascunho, aguardando a aprovação do Alexandre e as fontes de cada número (o vídeo do Docker não cita nenhuma)
---
O Docker é uma ferramenta que empacota um programa com tudo de que ele precisa numa imagem e a roda como um contêiner, isolado, em qualquer máquina. É a resposta a uma frase que quem trabalha com software já ouviu, ou já disse: "mas na minha máquina funciona". A ideia veio de outro lugar, das caixas de metal dos navios.

## A caixa que mudou o mundo

Até os anos 1950, carregar um navio era um trabalho lento: saco por saco, caixote por caixote, tudo feito à mão, e um navio podia ficar uma semana parado no porto. Em 1956, um empresário de caminhões chamado Malcom McLean teve uma ideia simples: e se tudo fosse numa caixa de metal, sempre do mesmo tamanho?

O navio Ideal X saiu de Nova Jersey com 58 dessas caixas, e o custo de carregar caiu muito. O guindaste não precisa saber o que tem dentro, seja banana ou televisão. Como a caixa é sempre igual, o mundo inteiro aprendeu a mover a mesma caixa.

## Na minha máquina funciona

Durante décadas, colocar um programa no ar era como o porto antes do contêiner. O programador escrevia o código no computador dele, com uma versão de cada coisa, e o servidor tinha outra versão, outra biblioteca, outra configuração.

Daí vinha a conversa difícil: o desenvolvedor dizia que funcionava, a equipe de operação dizia que não, e no fundo os dois tinham razão. Faltava uma caixa padrão para o software.

## As peças já existiam

As peças existiam havia muito tempo. Em 1979, o Unix ganhou o chroot, que prende um programa numa pasta só dele. Em 2000, o FreeBSD criou as jails. Por volta de 2008, o Linux reuniu os namespaces, que isolam o que cada processo enxerga, e os cgroups, criados por engenheiros do Google para limitar a memória e o processador de cada um.

Daí nasceu o LXC, os contêineres do Linux. Funcionava, mas era coisa de especialista: comandos longos, configuração trabalhosa e nada que se pudesse empacotar e entregar para outra pessoa.

## Cinco minutos em 2013

A dotCloud era uma pequena empresa de hospedagem que passava por um momento difícil. Para rodar os clientes, tinha criado uma ferramenta interna que tornava os contêineres fáceis. Em março de 2013, o fundador, Solomon Hykes, subiu ao palco da PyCon para uma palestra relâmpago de 5 minutos.

Foram suficientes. A empresa abriu o código do Docker, a comunidade abraçou a ideia, e poucos meses depois a dotCloud mudou de nome e passou a se chamar Docker.

## A receita, a caixa e o contêiner

O Docker trouxe três ideias simples. O Dockerfile é a receita: um pequeno arquivo de texto dizendo o que vai dentro. A imagem é a caixa já fechada, com o programa e tudo de que ele precisa. O contêiner é essa caixa rodando, isolada, em qualquer máquina.

Como o contêiner compartilha o núcleo do sistema, ele é bem mais leve que uma máquina virtual inteira e sobe em segundos. Com o Docker Hub, a imagem de um banco de dados ou de um site se baixa com um único comando. Como o guindaste, o Docker não precisa saber o que tem dentro.

## De uma caixa a milhões

Quando são milhares de caixas, alguém precisa organizar o porto. Em 2014, o Google lançou o Kubernetes, que distribui e cuida dos contêineres em muitas máquinas. Em 2015, várias empresas criaram juntas a Open Container Initiative, um padrão aberto para o formato da caixa.

Foi o mesmo caminho dos navios: primeiro a caixa, depois o padrão. Hoje, da loja virtual ao aplicativo do banco, muito do que se usa no dia a dia roda dentro de um contêiner.
