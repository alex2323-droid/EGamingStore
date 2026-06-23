export const getEmails = async (accessToken: string) => {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch emails');
  }

  const data = await res.json();
  const messages = data.messages || [];

  const detailedMessages = await Promise.all(
    messages.map(async (msg: any) => {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return await msgRes.json();
    })
  );

  return detailedMessages;
};

export const parseEmailData = (email: any) => {
  const headers = email.payload.headers;
  const getHeader = (name: string) => {
    const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  };

  return {
    id: email.id,
    subject: getHeader('subject') || 'No Subject',
    from: getHeader('from') || 'Unknown Sender',
    date: getHeader('date'),
    snippet: email.snippet,
  };
};
