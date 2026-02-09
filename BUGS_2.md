# BUGS 2nd Interation

1. Error 1

## Error Type
Console Error

## Error Message
In HTML, <button> cannot be a descendant of <button>.
This will cause a hydration error.

  ...
    <Styled(div) as="div" ref={null} className="MuiBox-root" theme={{...}} sx={{width:"100%", ...}}>
      <Insertion>
      <div className="MuiBox-roo...">
        <Box>
        <Box sx={{display:"flex", ...}}>
          <Styled(div) as="div" ref={null} className="MuiBox-root" theme={{...}} sx={{display:"flex", ...}}>
            <Insertion>
            <div className="MuiBox-roo...">
              <SessionCard session={{id:"779e31...", ...}} onSelect={function Page.useCallback[handleSelectSession]} ...>
                <Card elevation={0} sx={{border:"1p...", ...}}>
                  <MuiCard-root className="MuiCard-root" elevation={0} ref={null} ownerState={{elevation:0, ...}} ...>
                    <Insertion>
                    <Paper className="MuiCard-ro..." elevation={0}>
                      <MuiPaper-root as="div" ownerState={{...}} className="MuiPaper-r..." ref={null} style={{...}}>
                        <Insertion>
                        <div className="MuiPaper-r..." style={{...}}>
                          <CardActionArea onClick={function onClick} sx={{p:0}}>
                            <MuiCardActionArea-root focusVisibleClassName="" onClick={function onClick} sx={{p:0}} ...>
                              <Insertion>
                              <ButtonBase focusVisibleClassName="" onClick={function onClick} className="MuiCardAct...">
                                <MuiButtonBase-root as="button" className="MuiButtonB..." ownerState={{...}} ...>
                                  <Insertion>
>                                 <button
>                                   className="MuiButtonBase-root MuiCardActionArea-root css-98ps2y-MuiButtonBase-root..."
>                                   onBlur={function useEventCallback.useRef}
>                                   onClick={function onClick}
>                                   onContextMenu={function useEventCallback.useRef}
>                                   onFocus={function useEventCallback.useRef}
>                                   onKeyDown={function useEventCallback.useRef}
>                                   onKeyUp={function useEventCallback.useRef}
>                                   onMouseDown={function useEventCallback.useRef}
>                                   onMouseLeave={function useEventCallback.useRef}
>                                   onMouseUp={function useEventCallback.useRef}
>                                   onDragLeave={function useEventCallback.useRef}
>                                   onTouchEnd={function useEventCallback.useRef}
>                                   onTouchMove={function useEventCallback.useRef}
>                                   onTouchStart={function useEventCallback.useRef}
>                                   tabIndex={0}
>                                   type="button"
>                                   disabled={false}
>                                   ref={function useForkRef.useMemo}
>                                 >
                                    ...
                                      <MuiIconButton-root id={undefined} className="MuiIconBut..." centerRipple={true} ...>
                                        <Insertion>
                                        <ButtonBase id={undefined} className="MuiIconBut..." centerRipple={true} ...>
                                          <MuiButtonBase-root as="button" className="MuiButtonB..." ...>
                                            <Insertion>
>                                           <button
>                                             className="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeSmall..."
>                                             onBlur={function useEventCallback.useRef}
>                                             onClick={function onClick}
>                                             onContextMenu={function useEventCallback.useRef}
>                                             onFocus={function useEventCallback.useRef}
>                                             onKeyDown={function useEventCallback.useRef}
>                                             onKeyUp={function useEventCallback.useRef}
>                                             onMouseDown={function useEventCallback.useRef}
>                                             onMouseLeave={function useEventCallback.useRef}
>                                             onMouseUp={function useEventCallback.useRef}
>                                             onDragLeave={function useEventCallback.useRef}
>                                             onTouchEnd={function useEventCallback.useRef}
>                                             onTouchMove={function useEventCallback.useRef}
>                                             onTouchStart={function useEventCallback.useRef}
>                                             tabIndex={0}
>                                             type="button"
>                                             disabled={null}
>                                             id={undefined}
>                                             aria-label="Delete session"
>                                             aria-labelledby={null}
>                                             data-mui-internal-clone-element={true}
>                                             onMouseOver={function}
>                                             ref={function useForkRef.useMemo}
>                                           >
              ...



    at button (unknown:0:0)
    at SessionCard (app/components/Session/SessionCard.tsx:90:15)
    at SessionCard (app/components/Session/SessionCard.tsx:89:13)
    at map ([native code]:null:null)
    at SessionList (app/components/Session/SessionList.tsx:80:28)
    at Page (app/page.tsx:70:9)

## Code Frame
  88 |             </Box>
  89 |             <Tooltip title="Delete session">
> 90 |               <IconButton
     |               ^
  91 |                 size="small"
  92 |                 onClick={(e) => {
  93 |                   e.stopPropagation();

Next.js version: 16.1.6 (Turbopack)


2. Error 2

## Error Type
Console Error

## Error Message
<button> cannot contain a nested <button>.
See this log for the ancestor stack trace.


    at button (unknown:0:0)
    at SessionCard (app/components/Session/SessionCard.tsx:57:7)
    at map ([native code]:null:null)
    at SessionList (app/components/Session/SessionList.tsx:80:28)
    at Page (app/page.tsx:70:9)

## Code Frame
  55 |       }}
  56 |     >
> 57 |       <CardActionArea onClick={() => onSelect(session.id)} sx={{ p: 0 }}>
     |       ^
  58 |         <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
  59 |           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
  60 |             <Box sx={{ flex: 1, minWidth: 0 }}>

Next.js version: 16.1.6 (Turbopack)


3. Error 3

## Error Type
Runtime TypeError

## Error Message
undefined is not an object (evaluating 'new Date().toISOString()')


    at buildExecutionsFromMessages (app/components/Chat/ChatView.tsx:27:37)
    at ChatView (app/components/Chat/ChatView.tsx:139:34)
    at Page (app/page.tsx:79:9)

## Code Frame
  25 | ): AgentExecution[] {
  26 |   const executions: AgentExecution[] = [];
> 27 |   const now = new Date().toISOString();
     |                                     ^
  28 |
  29 |   for (const msg of messages) {
  30 |     if (msg.role !== 'assistant' || !msg.content) continue;

Next.js version: 16.1.6 (Turbopack)
