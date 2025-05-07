'use client'
import { formatDistanceToNow } from 'date-fns'
import DOMPurify from 'dompurify'
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser'

export function formatDeadline(timestamp) {
  console.log(timestamp)
  if (timestamp) {
    const date = new Date(timestamp)
    let difference = formatDistanceToNow(date)

    difference = `${difference.charAt(0).toUpperCase()}${difference.slice(
      1,
    )} ago`
    return difference
  } else {
    return ''
  }
}

export function formatDate(createdAt) {
  const date = new Date(createdAt)
  const now = new Date()

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const formattedTime = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isToday) {
    return `Today ${formattedTime}`
  } else {
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    return `${formattedDate} ${formattedTime}`
  }
}

export function formatHours(createdAt) {
  if (!createdAt) {
    return ''
  }
  const date = new Date(createdAt)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Altere para true se preferir formato 12 horas
  })
}

export function formatDateWithoutTime(createdAt) {
  const date = new Date(createdAt)

  // Função auxiliar para obter o sufixo ordinal correto
  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  }

  const day = date.getDate()
  const formattedDate = date.toLocaleDateString('en-US', {
    day: '2-digit', // Usar '2-digit' para garantir que o dia sempre terá dois dígitos
    month: 'long',
    year: 'numeric',
  })

  // Adicionando o sufixo ordinal ao dia e convertendo o dia para string
  const ordinalDay = `${day}${getOrdinalSuffix(day)}`
  const dayString = day.toString().padStart(2, '0') // Converte o dia para string e adiciona um zero à esquerda se necessário

  // Substituindo o dia numérico pelo dia com sufixo ordinal
  return formattedDate.replace(dayString, ordinalDay)
}

export function transform(node, index) {
  if (node.type === 'tag') {
    switch (node.name) {
      case 'h1':
        node.attribs.style = 'font-size: 2rem; font-weight: bold;'
        break
      case 'h2':
        node.attribs.style = 'font-size: 1.5rem; font-weight: bold;'
        break
      case 'ul':
        node.attribs.style = 'list-style: disc; margin-left: 40px;' // Ajuste o valor conforme necessário
        break
      case 'ol':
        node.attribs.style = 'list-style: decimal; margin-left: 40px;' // Ajuste o valor conforme necessário
        break
      case 'strong':
      case 'b':
        node.attribs.style = 'font-weight: bold;'
        break
      case 'em':
      case 'i':
        node.attribs.style = 'font-style: italic;'
        break
      case 'li':
        if (node.attribs.class && node.attribs.class.includes('ql-indent-1')) {
          node.attribs.style = 'margin-left: 30px;' // Adicione mais estilos se a classe ql-indent-1 tiver especificidades
        }
        break
      // Adicione mais casos conforme necessário
    }
  }
  return convertNodeToElement(node, index, transform)
}

export function removeTrailingBrTags(htmlContent) {
  // Remove qualquer sequência de tags vazias com <br> ou cursor no final
  // A expressão regular agora considera a presença do cursor
  // eslint-disable-next-line prettier/prettier, no-irregular-whitespace
  return htmlContent.replace(/(<[^>]+>)*(\s*<br>\s*|<span class="ql-cursor">﻿<\/span>\s*)+(<\/[^>]+>)*\s*$/gi, '');
}

export function getSanitizeText(content: string) {
  // Primeiro, sanitizar o conteúdo HTML
  const cleanHtml = DOMPurify.sanitize(content)
  console.log('clean gtrml')
  console.log(cleanHtml)

  // Em seguida, remover os <br> inúteis no final
  const htmlWithoutTrailingBr = removeTrailingBrTags(cleanHtml)

  // Finalmente, transformar o HTML e retornar
  const htmlTransformado = ReactHtmlParser(htmlWithoutTrailingBr, {
    transform,
  })
  console.log(htmlTransformado)

  return htmlTransformado
}

export function isDifferentDay(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return (
    d1.getDate() !== d2.getDate() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getFullYear() !== d2.getFullYear()
  )
}

export function getDifferenceInSeconds(date1, date2): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const timestamp1 = d1.getTime()
  const timestamp2 = d2.getTime()
  const difference = Math.abs(timestamp1 - timestamp2)
  return Math.floor(difference / 1000)
}

export function transformString(str) {
  if (str?.length <= 6) {
    return str
  }

  const firstThree = str?.substring(0, 9)
  const lastThree = str?.substring(str?.length - 9)

  return firstThree + '...' + lastThree
}

export async function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
