'use client'
import { formatDistanceToNow } from 'date-fns'
import DOMPurify from 'dompurify'
import parse, {
  domToReact,
  attributesToProps,
  Element,
} from 'html-react-parser'
import React from 'react'

export function formatDeadline(timestamp) {
  const date = new Date(timestamp * 1000)
  return formatDistanceToNow(date, { addSuffix: true })
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

export function processHtml(htmlString: string) {
  // Remove <br> at the end
  const htmlWithoutTrailingBr = htmlString.replace(/<br>\s*$/i, '')

  // Replace <p><br></p> with <div></div> - Adjusted to handle potential whitespace
  let processedHtml = htmlWithoutTrailingBr.replace(
    /<p>\s*(<br\s*\/?>)?\s*<\/p>/gi,
    '<div></div>'
  )

  // Sanitize the HTML
  const cleanHtml = DOMPurify.sanitize(processedHtml, {
    USE_PROFILES: { html: true },
  })

  const options = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        if (domNode.name === 'pre') {
          // Add class for code block styling
          const props = attributesToProps(domNode.attribs)
          return (
            <pre {...props} className='code-block'>
              {domToReact(domNode.children as any, options)}
            </pre>
          )
        }

        if (domNode.name === 'p') {
          // Add class for paragraph styling
          const props = attributesToProps(domNode.attribs)
          return (
            <p {...props} className='paragraph'>
              {domToReact(domNode.children as any, options)}
            </p>
          )
        }

        // Handle lists if necessary (example)
        // if (domNode.name === 'ul') {
        //   const props = attributesToProps(domNode.attribs)
        //   return <ul {...props} style={{ listStyle: 'disc', marginLeft: '40px' }}>{domToReact(domNode.children, options)}</ul>
        // }
        // if (domNode.name === 'ol') {
        //   const props = attributesToProps(domNode.attribs)
        //   return <ol {...props} style={{ listStyle: 'decimal', marginLeft: '40px' }}>{domToReact(domNode.children, options)}</ol>
        // }
      }
    },
  }

  // Parse the sanitized HTML with options
  const reactElement = parse(cleanHtml, options)

  return reactElement
}

export function removeTrailingBrTags(htmlContent) {
  if (typeof htmlContent !== 'string') {
    return htmlContent
  }
  return htmlContent.replace(/^(.*?)<br\s*\/?>(<\/p>)?\s*$/i, '$1$2')
}

export function getSanitizeText(content: string) {
  // All sanitization and transformation is now handled by processHtml
  return processHtml(content)
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
