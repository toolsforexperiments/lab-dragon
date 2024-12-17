import CheckIcon from '@mui/icons-material/Check';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';


export function LibraryIcon(props) {
    return (
        <svg width="50" height="50" viewBox="2 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g id="Library">
                <rect x="15" y="15" width="6" height="20" fill="currentColor"/>
                <rect x="23" y="15" width="6" height="20" fill="currentColor"/>
                <rect x="30" y="16.6367" width="6" height="18.7468"
                      transform="rotate(-15.8276 30 16.6367)" fill="currentColor"/>
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
            return null
    }
}













