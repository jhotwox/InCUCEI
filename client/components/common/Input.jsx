import { HelperText, TextInput, useTheme } from "react-native-paper"
import ShakeView from "./ShakeView"
import { forwardRef, useImperativeHandle, useRef, useState } from "react"

/**
 * ForwardRef Input component that wraps a TextInput with optional password behavior,
 * icons, underline color logic and an error HelperText, and exposes imperative methods.
 *
 * @param {object} props - Component props.
 * @param {string} [placeholder=""] - Placeholder text for the TextInput.
 * @param {string} value - Controlled value of the input.
 * @param {(text: string) => void} [setValue=""] - Callback invoked on text change.
 * @param {string|React.ReactNode} [leftIcon] - Icon to render on the left side of the input.
 * @param {boolean} [isPassword=false] - Enables password mode with a visibility toggle when true.
 * @param {string} [error=""] - Error message; when non-empty, HelperText is shown.
 * @param {string|React.ReactNode|null} [rightIcon=null] - Icon to render on the right side when not a password field.
 * @param {...any} [props] - Additional props forwarded to the underlying TextInput.
 * @param {React.Ref} ref - Ref that will receive imperative methods.
 *
 * Imperative methods exposed on ref:
 * @property {() => void} ref.shake - Triggers the ShakeView shake animation (if available).
 * @property {() => void} ref.focus - Focuses the underlying TextInput.
 * @property {() => void} ref.blur - Removes focus from the underlying TextInput.
 * @property {() => boolean} ref.isEmpty - Returns false if an error is present OR the trimmed value is empty; returns true otherwise.
 *
 * Internal behavior:
 * - Maintains `visible` state to toggle secureTextEntry for password inputs.
 * - getUnderlineColor logic (uses theme.colors):
 *     - if isPassword && value.length > 0 && value.length < 3 => error color
 *     - else if isPassword && value.length > 0 && value.length < 6 => tertiary color
 *     - otherwise => primary color
 * - Renders left/right icons via TextInput.Icon; right side shows an eye/eye-off toggle when isPassword.
 * - Renders HelperText with error message when props.error is non-empty.
 *
 * @returns {JSX.Element} The rendered input (TextInput wrapped in ShakeView) with error HelperText.
 */
export default forwardRef(
  (
    {
      placeholder = "",
      value,
      setValue = "",
      leftIcon,
      isPassword = false,
      error = "",
      rightIcon = null,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false)
    const inputRef = useRef(null)
    const shakeRef = useRef(null)
    const theme = useTheme()

    useImperativeHandle(ref, () => ({
      shake: () => shakeRef.current?.shake(),
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      isEmpty: () => {
        if (error !== "" || value.trim() === "") return false
        return true
      },
    }))

    const handleVisible = () => setVisible((prev) => !prev)

    const getUnderlineColor = () => {
      if (isPassword) {
        if (value.length > 0 && value.length < 3) return theme.colors.error
        if (value.length > 0 && value.length < 6) return theme.colors.tertiary
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
          left={<TextInput.Icon icon={leftIcon} />}
          right={
            isPassword ? (
              <TextInput.Icon
                icon={visible ? "eye" : "eye-off"}
                onPress={handleVisible}
              />
            ) : (
              rightIcon && <TextInput.Icon icon={rightIcon} />
            )
          }
          activeUnderlineColor={getUnderlineColor()}
          underlineColor={getUnderlineColor()}
          secureTextEntry={isPassword && !visible}
          {...(isPassword
            ? { autoCapitalize: "none", autoCorrect: false }
            : {})}
          {...props}
        />
        <HelperText
          type="error"
          visible={error !== ""}
          style={{
            backgroundColor: theme.colors.errorContainer,
            marginBottom: -16,
          }}
        >
          {error}
        </HelperText>
      </ShakeView>
    )
  }
)
