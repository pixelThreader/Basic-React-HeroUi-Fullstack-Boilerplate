import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button
} from "@heroui/react";

interface ConfirmModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    confirmColor?: "primary" | "danger" | "warning" | "default" | "secondary" | "success";
}

export const ConfirmModal = ({
    isOpen,
    onOpenChange,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmLabel = "Confirm",
    confirmColor = "danger"
}: ConfirmModalProps) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
                        <ModalBody>
                            <p className="text-default-500">{message}</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color={confirmColor}
                                onPress={() => {
                                    onConfirm();
                                    onClose();
                                }}
                            >
                                {confirmLabel}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
