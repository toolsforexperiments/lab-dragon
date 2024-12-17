import { useEffect } from "react";
import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {styled} from "@mui/material/styles";
import {EntityIcon} from "@/app/components/icons/EntityIcons";
import {RichTreeView} from "@mui/x-tree-view/RichTreeView";
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks/useTreeViewApiRef';


function createTreeStructure(item) {
    // The first item sent to this function will not be included in the return
    let ret = [];
    if (item.children && item.children.length > 0) {
        ret = item.children.map(child => ({
            id: child.id,
            label: child.name,
            children: createTreeStructure(child)
        }));
    }
    return ret;
}


const EntIcon = styled(EntityIcon)(({theme}) => ({
    color: theme.palette.primary.dark,
    marginRight: '10px',
}));


const NotebookAccordions = styled(Accordion)(({ theme }) => ({
    backgroundColor: theme.palette.background.notebookAccordion,
}));


const NotebookTree = styled(RichTreeView)(({ theme }) => ({

}));


export default function NotebookAccordion({ notebookStructure, onSelectedItemsChange, selectedEntity }) {

    const treeApiRef = useTreeViewApiRef();

    useEffect(() => {
        if (selectedEntity && treeApiRef.current) {
            const ret_from_get_item = treeApiRef.current.getItem(selectedEntity);
            if (!ret_from_get_item) {
                treeApiRef.current.selectItem({ itemId: selectedEntity});
            }
        }
    }, [selectedEntity]);


    return (
        <NotebookAccordions key={notebookStructure.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <EntIcon type={notebookStructure.type} />
                <Typography variant="h6">{notebookStructure.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {Object.keys(notebookStructure.children).length === 0 ? (
                    <Typography variant="h6"> Notebook is empty, please create a project</Typography>
                ) : (
                    <NotebookTree
                        expansionTrigger="iconContainer"
                        items={createTreeStructure(notebookStructure)}
                        onSelectedItemsChange={onSelectedItemsChange}
                        apiRef={treeApiRef}
                    />
                )}
            </AccordionDetails>
        </NotebookAccordions>
    )

}




