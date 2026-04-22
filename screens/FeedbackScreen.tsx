import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  View,
} from "react-native";
import AppLayout from "../components/AppLayout";

const TOKEN =
  "Bearer f09d2f09e9b42a5035b067405cbc9fe94248df944e15a8381ff658398195";

export default function FeedbackScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    comments: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      comments: "",
    };

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedComments = comments.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!trimmedName) {
      newErrors.name = "Please enter your name";
      valid = false;
    } else if (trimmedName.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      valid = false;
    }

    if (!trimmedEmail) {
      newErrors.email = "Please enter your email";
      valid = false;
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (!trimmedPhone) {
      newErrors.phone = "Please enter your phone number";
      valid = false;
    } else if (!phoneRegex.test(trimmedPhone)) {
      newErrors.phone = "Phone number must be 10 digits";
      valid = false;
    }

    if (!trimmedComments) {
      newErrors.comments = "Please enter your comments";
      valid = false;
    } else if (trimmedComments.length < 10) {
      newErrors.comments = "Comments must be at least 10 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const clearFieldError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const submitFeedback = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const url = `https://vai.bmtpc.netcreativemind.com/api/v1/feedback-form?name=${encodeURIComponent(
        name.trim()
      )}&email=${encodeURIComponent(email.trim())}&comments=${encodeURIComponent(
        comments.trim()
      )}&phone=${encodeURIComponent(phone.trim())}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: TOKEN,
        },
      });

      const json = await res.json();
      console.log("Feedback response:", json);

      Alert.alert("Success", "Feedback submitted successfully");

      setName("");
      setEmail("");
      setPhone("");
      setComments("");
      setErrors({
        name: "",
        email: "",
        phone: "",
        comments: "",
      });
    } catch (err) {
      console.log("Feedback error:", err);
      Alert.alert("Error", "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title=""
      subtitle="Share your feedback"
      showBack
      showLogo
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          value={name}
          onChangeText={(text) => {
            setName(text);
            clearFieldError("name");
          }}
          placeholder="Enter your name"
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearFieldError("email");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter your email"
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={[styles.input, errors.phone ? styles.inputError : null]}
          value={phone}
          onChangeText={(text) => {
            setPhone(text.replace(/[^0-9]/g, ""));
            clearFieldError("phone");
          }}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="Enter phone number"
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

        <Text style={styles.label}>Comments</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            errors.comments ? styles.inputError : null,
          ]}
          value={comments}
          onChangeText={(text) => {
            setComments(text);
            clearFieldError("comments");
          }}
          placeholder="Write your feedback"
          multiline
        />
        {errors.comments ? (
          <Text style={styles.errorText}>{errors.comments}</Text>
        ) : null}

        <Pressable
          style={[styles.button, loading ? styles.buttonDisabled : null]}
          onPress={submitFeedback}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Feedback</Text>
          )}
        </Pressable>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: "#222",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#FA8128",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});