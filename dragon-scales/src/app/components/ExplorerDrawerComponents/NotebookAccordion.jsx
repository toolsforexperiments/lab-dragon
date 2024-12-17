import { useRef, useEffect } from "react";
import {Accordion, AccordionDetails, AccordionSummary, Typography, IconButton, Box} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {styled} from "@mui/material/styles";
import {RichTreeView} from "@mui/x-tree-view/RichTreeView";
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks/useTreeViewApiRef';
import { TreeItem2 } from "@mui/x-tree-view";
import MoreVertIcon from '@mui/icons-material/MoreVert';

import {EntityIcon} from "@/app/components/icons/EntityIcons";


const EntIcon = styled(EntityIcon)(({theme}) => ({
    color: theme.palette.primary.dark,
    marginRight: '10px',
}));


const NotebookAccordions = styled(Accordion)(({ theme }) => ({
    backgroundColor: theme.palette.background.notebookAccordion,
}));


const NotebookTree = styled(RichTreeView)(({ theme }) => ({

}));


const CustomTreeItem = (props) => {
    const { label, type, selected, itemId } = props;

    return (
        <TreeItem2
            {...props}
            slots={{
                label: () => (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        py: 0.5
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EntIcon type={type} />
                            <Typography>{label}</Typography>
                        </Box>
                        {selected !== null && selected === itemId && (
                            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                )
            }}
        />
    );
};


export default function NotebookAccordion({ notebookStructure, onSelectedItemsChange, selectedEntity }) {

    // Holds the ID of items as keys and all of the values needed for that item as values
    const itemsIndex = useRef({});
    const treeApiRef = useTreeViewApiRef();

    function createTreeStructure(item) {
        // The first item sent to this function will not be included in the return
        let ret = [];
        itemsIndex.current[item.id] = item;
        if (item.children && item.children.length > 0) {
            ret = item.children.map(child => ({
                id: child.id,
                label: child.name,
                type: child.type,
                children: createTreeStructure(child)
            }));
            
        }
        return ret;
    }

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
                        slots={{
                            item: CustomTreeItem,
                        }}
                        slotProps={{
                            item: (itemData) => ({
                                type: itemsIndex.current[itemData.itemId].type,
                                selected: selectedEntity,
                            })
                        }}
                    />
                )}
            </AccordionDetails>
        </NotebookAccordions>
    )

}




