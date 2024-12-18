import CheckIcon from '@mui/icons-material/Check';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

export function LibraryIcon(props) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Library Icon">
        <rect id="Rectangle 58" x="2" y="3" width="3" height="18" fill="currentColor"/>
        <rect id="Rectangle 59" x="7" y="5" width="3" height="16" fill="currentColor"/>
        <rect id="Rectangle 60" x="12" y="3" width="3" height="18" fill="currentColor"/>
        <rect id="Rectangle 61" x="16.2641" y="6.01709" width="3.34801" height="14.9363" transform="rotate(-9.3732 16.2641 6.01709)" fill="currentColor"/>
        </g>
        </svg>
    )
}

export function NotebookIcon(props) {
    return <MenuBookIcon {...props}/>
}


export function ProjectIcon(props) {
    return <AssignmentIcon {...props}/>
}


export function TaskIcon(props) {
    return <FormatListBulletedIcon {...props}/>
}

export function StepIcon(props) {
    return <CheckIcon {...props}/>
}


export function EntityIcon({type, sx, ...props}) {

    const iconProps = {sx, ...props}
    switch (type) {
        case "Library":
            return <LibraryIcon {...iconProps}/>
        case "Notebook":
            return <NotebookIcon {...iconProps}/>
        case "Project":
            return <ProjectIcon {...iconProps}/>
        case "Task":
            return <TaskIcon {...iconProps}/>
        case "Step":
            return <StepIcon {...iconProps}/>
        default:
            return <QuestionMarkIcon {...iconProps}/>
    }
}













