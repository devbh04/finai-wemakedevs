import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const markdownInput = formData.get('markdown_input') as string
    const userQuestion = formData.get('user_question') as string

    if (!markdownInput || !userQuestion) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Both markdown_input and user_question are required' 
        },
        { status: 400 }
      )
    }

    // Forward the request to the Python backend
    const backendFormData = new FormData()
    backendFormData.append('markdown_input', markdownInput)
    backendFormData.append('user_question', userQuestion)

    const response = await fetch('http://localhost:8000/chatbot/chat', {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Chatbot API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process chat request. Please ensure the backend server is running.' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Chatbot API is running. Use POST method to send chat requests.',
      endpoints: {
        chat: 'POST /api/chatbot/chat'
      }
    }
  )
}
