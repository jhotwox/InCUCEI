import { HelperText, TextInput, useTheme } from "react-native-paper"
import ShakeView from "./ShakeView"
import { forwardRef, useImperativeHandle, useRef, useState } from "react"

export default forwardRef(({
  placeholder="",
  value, setValue="",
  leftIcon,
  isPassword=false,
  error="",
  ...props
}, ref) => {
  const [visible, setVisible] = useState(false)
  const inputRef = useRef(null)
  const shakeRef = useRef(null)
  const theme = useTheme()

  useImperativeHandle(ref, () => ({
    shake: () => shakeRef.current?.shake(),
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur()
  }))

  const handleVisible = () => setVisible(prev => !prev)

  const getUnderlineColor = () => {
    if (isPassword) {
      if (value.length > 0 && value.length < 3)  
        return theme.colors.error
      if (value.length > 0 && value.length < 6)
        return theme.colors.tertiary
    }
    return theme.colors.primary
  }
  
  return (
    <ShakeView ref={shakeRef}>
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        left={ <TextInput.Icon icon={leftIcon} /> }
        right={ isPassword ? <TextInput.Icon icon={visible ? "eye" : "eye-off"} onPress={handleVisible} /> : null }
        activeUnderlineColor={getUnderlineColor()}
        underlineColor={getUnderlineColor()}
        secureTextEntry={isPassword && !visible}
        {...(isPassword ? { autoCapitalize: "none", autoCorrect: false } : {})}
        {...props}
      />
      <HelperText type="error" visible={error !== ""} style={{ backgroundColor: theme.colors.errorContainer, marginBottom: -16, }}>
        {error}
      </HelperText>
    </ShakeView>
  )
})