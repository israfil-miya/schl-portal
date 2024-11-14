import cn from './cn';

// setCalculatedZIndex: set the z-index of the menu and menuPortal
const setCalculatedZIndex = (baseZIndex: number = 50) => {
  return {
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: baseZIndex + 0, // baseZIndex + 1
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: baseZIndex + 0, // baseZIndex + 1
    }),
  };
};

// setClassNameAndIsDisabled: set the className and isDisabled of the select component
const setClassNameAndIsDisabled = (
  isOpen: boolean = false,
  isDisabled: boolean | undefined = undefined,
  className: string = '',
) => {
  // set isDisabled to true if isOpen is false and set the className to 'visible' else set it to 'invisible' (also merge the className with the provided className and give priority to provided isDisabled)
  isDisabled = typeof isDisabled === 'boolean' ? isDisabled : !isOpen;
  className = cn`${isOpen ? 'visible' : 'invisible'} ${className}`;

  return {
    isDisabled,
    className,
  };
};

// setMenuPortalTarget: set the target of the menuPortal
const setMenuPortalTarget =
  typeof window !== 'undefined' ? document.body : undefined;

export { setCalculatedZIndex, setClassNameAndIsDisabled, setMenuPortalTarget };
